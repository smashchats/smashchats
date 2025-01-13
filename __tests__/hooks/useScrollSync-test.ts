import { renderHook } from "@testing-library/react-native";
import { SharedValue } from "react-native-reanimated";
import useScrollSync, { ScrollConfig, scrollTo } from "@/src/hooks/useScrollSync";

describe("generating a NativeScrollEvent with `scrollTo`", () => {
    it("should return an object with the correct properties", () => {
        const result = scrollTo(100);
        expect(result).toStrictEqual(expect.objectContaining({
            nativeEvent: {
                contentOffset: {
                    y: 100
                }
            }
        }));
    });
});

describe("useScrollSync", () => {
    const mockScrollTo = jest.fn();
    const mockScrollToOffset = jest.fn();

    const createMockRef = (hasScrollTo: boolean) => ({
        current: {
            hasOwnProperty: () => hasScrollTo,
            scrollTo: hasScrollTo ? mockScrollTo : undefined,
            scrollToOffset: !hasScrollTo ? mockScrollToOffset : undefined
        }
    });

    const mockHeaderConfig = {
        heightCollapsed: 50,
        heightExpanded: 200
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should sync scroll for ScrollView", () => {
        const mockScrollConfigs = [{
            scrollableRef: createMockRef(true),
            position: { value: 0 } as SharedValue<number>,
            invert: false
        }] as unknown as ScrollConfig[];

        const { result } = renderHook(() => useScrollSync(mockScrollConfigs, mockHeaderConfig));

        result.current.sync(scrollTo(100));

        expect(mockScrollTo).toHaveBeenCalledWith({
            y: 100,
            animated: false
        });
    });

    it("should sync scroll for FlatList", () => {
        const mockScrollConfigs = [{
            scrollableRef: createMockRef(false),
            position: { value: 0 } as SharedValue<number>,
            invert: false
        }] as unknown as ScrollConfig[];

        const { result } = renderHook(() => useScrollSync(mockScrollConfigs, mockHeaderConfig));

        result.current.sync(scrollTo(100));

        expect(mockScrollToOffset).toHaveBeenCalledWith({
            offset: 100,
            animated: false
        });
    });

    it("should not sync scroll when position is greater than header difference", () => {
        const mockScrollConfigs = [{
            scrollableRef: createMockRef(true),
            position: { value: 200 } as SharedValue<number>,
            invert: false
        }] as unknown as ScrollConfig[];

        const { result } = renderHook(() => useScrollSync(mockScrollConfigs, mockHeaderConfig));

        result.current.sync(scrollTo(200));

        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it("should limit scroll to header difference", () => {
        const mockScrollConfigs = [{
            scrollableRef: createMockRef(true),
            position: { value: 0 } as SharedValue<number>,
            invert: false
        }] as unknown as ScrollConfig[];

        const { result } = renderHook(() => useScrollSync(mockScrollConfigs, mockHeaderConfig));

        result.current.sync(scrollTo(200));

        expect(mockScrollTo).toHaveBeenCalledWith({
            y: 150, // headerDiff = heightExpanded(200) - heightCollapsed(50) = 150
            animated: false
        });
    });
});
