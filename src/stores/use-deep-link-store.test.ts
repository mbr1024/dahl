import { beforeEach, describe, expect, it } from "vitest";
import { useDeepLinkStore } from "./use-deep-link-store";

describe("useDeepLinkStore", () => {
  beforeEach(() => useDeepLinkStore.setState({ urls: [] }));

  it("keeps recent URLs unique and capped", () => {
    useDeepLinkStore.getState().addUrls(["dahl://one", "dahl://two"]);
    useDeepLinkStore.getState().addUrls(["dahl://two", "dahl://three"]);

    expect(useDeepLinkStore.getState().urls).toEqual(["dahl://two", "dahl://three", "dahl://one"]);
  });
});
