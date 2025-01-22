import { renderHook } from "@testing-library/react-native";
import { SharedValue } from "react-native-reanimated";
import useScrollSync, { ScrollConfig } from "@/src/hooks/useScrollSync";

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

        result.current.sync(100);

        expect(mockScrollTo).toHaveBeenCalledWith({
            y: 100,
            animated: false
        });
    });

    it("should not sync scroll for virtual FlatList", () => {
        const mockScrollConfigs = [{
            scrollableRef: createMockRef(false),
            position: { value: 0 } as SharedValue<number>,
            virtual: true
        }] as unknown as ScrollConfig[];

        const { result } = renderHook(() => useScrollSync(mockScrollConfigs, mockHeaderConfig));

        result.current.sync(100);

        expect(mockScrollToOffset).not.toHaveBeenCalled();
    });

    it("should not sync scroll when position is greater than header difference", () => {
        const mockScrollConfigs = [{
            scrollableRef: createMockRef(true),
            position: { value: 200 } as SharedValue<number>,
            invert: false
        }] as unknown as ScrollConfig[];

        const { result } = renderHook(() => useScrollSync(mockScrollConfigs, mockHeaderConfig));

        result.current.sync(200);

        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it("should limit scroll to header difference", () => {
        const mockScrollConfigs = [{
            scrollableRef: createMockRef(true),
            position: { value: 0 } as SharedValue<number>,
            invert: false
        }] as unknown as ScrollConfig[];

        const { result } = renderHook(() => useScrollSync(mockScrollConfigs, mockHeaderConfig));

        result.current.sync(200);

        expect(mockScrollTo).toHaveBeenCalledWith({
            y: 150, // headerDiff = heightExpanded(200) - heightCollapsed(50) = 150
            animated: false
        });
    });
});
