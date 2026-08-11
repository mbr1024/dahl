// Tauri 脚手架示例：Rust 侧命令与系统托盘
// 命令通过 `invoke_handler` 注册，前端用 `@tauri-apps/api/core` 的 `invoke` 调用

use serde::Serialize;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

/// 演示命令：返回应用运行环境信息（OS / 架构 / 可执行文件路径）
#[derive(Serialize)]
struct SystemInfo {
    os: &'static str,
    arch: &'static str,
    family: &'static str,
    exe: String,
}

/// 演示命令：返回结构化数据（serde 自动序列化为 JSON 给前端）
#[tauri::command]
fn system_info() -> SystemInfo {
    SystemInfo {
        os: std::env::consts::OS,
        arch: std::env::consts::ARCH,
        family: std::env::consts::FAMILY,
        exe: std::env::current_exe()
            .map(|p| p.display().to_string())
            .unwrap_or_default(),
    }
}

fn toggle_main_window(app: &tauri::AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        let visible = win.is_visible().unwrap_or(true);
        if visible {
            let _ = win.hide();
        } else {
            let _ = win.show();
            let _ = win.set_focus();
        }
    }
}

/// 更新安装完成后重启到新版本。
/// 不能直接用 relaunch（spawn 新进程 + 退出旧进程）：新进程启动时 single-instance
/// 插件检测到旧进程的 socket 还在，会直接让位退出，导致旧版本继续运行。
/// 改为"延迟启动器"：先安排一个分离进程在 1.5s 后启动新版本，再退出当前进程——
/// 届时旧进程已退出、socket 已清理，新版本以主实例身份启动。
#[tauri::command]
fn restart_app(app: tauri::AppHandle) {
    if let Some(cmd) = launch_after_delay_command() {
        let _ = std::process::Command::new("sh")
            .arg("-c")
            .arg(format!("sleep 1.5 && {cmd}"))
            .spawn();
    }
    app.exit(0);
}

/// 根据当前可执行文件推导"启动新版本"的 shell 命令。
fn launch_after_delay_command() -> Option<String> {
    let exe = std::env::current_exe().ok()?;
    #[cfg(target_os = "macos")]
    {
        // /path/Dahl.app/Contents/MacOS/dahl → /path/Dahl.app
        let bundle = app_bundle_path(&exe)?;
        Some(format!("open '{}'", bundle.display()))
    }
    #[cfg(target_os = "windows")]
    {
        // Windows 无 sh，改用 cmd 的 start；由外层 sh -c 组装
        Some(format!("start \"\" \"{}\"", exe.display()))
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Some(format!("'{}'", exe.display()))
    }
}

/// macOS：从可执行文件路径推导 .app bundle 路径（MacOS → Contents → <App>.app）。
fn app_bundle_path(exe: &std::path::Path) -> Option<std::path::PathBuf> {
    let macos_dir = exe.parent()?;
    if macos_dir.file_name()? != "MacOS" {
        return None;
    }
    let contents_dir = macos_dir.parent()?;
    if contents_dir.file_name()? != "Contents" {
        return None;
    }
    Some(contents_dir.parent()?.to_path_buf())
}

/// 系统托盘：左键单击切换主窗口显隐，右键菜单提供"退出"
fn setup_tray(app: &mut tauri::App) -> tauri::Result<()> {
    // macOS 菜单栏规范是 monochrome template image（系统自动按深浅色反色）
    static TRAY_ICON: &[u8] = include_bytes!("../icons/tray.png");
    let img = image::load_from_memory(TRAY_ICON)
        .expect("tray.png 解码失败")
        .to_rgba8();
    let (w, h) = img.dimensions();
    let tray_icon = tauri::image::Image::new_owned(img.into_raw(), w, h);

    let toggle = MenuItem::with_id(app, "toggle", "显示 / 隐藏窗口", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&toggle, &quit])?;

    TrayIconBuilder::with_id("main-tray")
        .icon(tray_icon)
        .icon_as_template(true)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "quit" => app.exit(0),
            "toggle" => toggle_main_window(app),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_main_window(tray.app_handle());
            }
        })
        .build(app)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    // 注意顺序：log 插件必须先于 wdio 插件注册，否则 wdio 会先抢占全局 logger 导致 log 插件初始化失败
    builder = builder.plugin(
        tauri_plugin_log::Builder::new()
            .level(tauri_plugin_log::log::LevelFilter::Info)
            .build(),
    );
    #[cfg(debug_assertions)]
    {
        // 仅 dev 构建注册 WebdriverIO 测试插件（embedded WebDriver + 前端交互），
        // release 构建不包含，避免把测试后门带进生产产物
        builder = builder
            .plugin(tauri_plugin_wdio::init())
            .plugin(tauri_plugin_wdio_webdriver::init());
    }
    builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // 单实例：再次启动时聚焦已有窗口
            toggle_main_window(app);
        }))
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            setup_tray(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            // 主窗口关闭时隐藏到托盘（而非退出），托盘"退出"才真正结束进程
            if window.label() == "main" {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![system_info, restart_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    /// system_info 是纯函数命令，可直接断言返回的平台信息非空
    #[test]
    fn system_info_reports_current_platform() {
        let info = system_info();
        assert!(!info.os.is_empty(), "os 不应为空");
        assert!(!info.arch.is_empty(), "arch 不应为空");
        assert!(!info.family.is_empty(), "family 不应为空");
        assert!(!info.exe.is_empty(), "exe 路径不应为空");
    }

    /// 托盘图标必须是可解码的 PNG（macOS template 图标，单色 + alpha）
    #[test]
    fn tray_icon_is_valid_png() {
        static TRAY_ICON: &[u8] = include_bytes!("../icons/tray.png");
        let img = image::load_from_memory(TRAY_ICON).expect("tray.png 解码失败");
        assert!(img.width() > 0 && img.height() > 0, "图标尺寸应大于 0");
        assert_eq!(img.color().has_alpha(), true, "template 图标需要 alpha 通道");
    }

    /// 从可执行文件路径推导 .app bundle 路径
    #[test]
    fn app_bundle_path_derives_bundle_from_binary() {
        let exe = std::path::Path::new("/Applications/Dahl.app/Contents/MacOS/dahl");
        let bundle = app_bundle_path(exe).expect("应推导出 bundle 路径");
        assert_eq!(bundle, std::path::Path::new("/Applications/Dahl.app"));

        // 非标准结构返回 None
        assert!(app_bundle_path(std::path::Path::new("/usr/local/bin/dahl")).is_none());
        assert!(
            app_bundle_path(std::path::Path::new("/Applications/Dahl.app/Contents/dahl")).is_none()
        );
    }
}
