import { fireEvent, render } from "@testing-library/react-native";

import { SelectableContact } from "@/src/ui/components/SelectableContact";

describe("SelectableContact", () => {
    it("renders correctly", () => {
        const tree = render(
            <SelectableContact
                contact={{ meta_title: "John Doe" }}
                selected={false}
                onPress={() => {}}
            />
        ).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("emits on press", () => {
        const onPress = jest.fn();
        const { getByTestId } = render(
            <SelectableContact
                contact={{ meta_title: "John Doe" }}
                selected={false}
                onPress={onPress}
            />
        );
        const pressable = getByTestId("SelectableContact::Pressable");
        fireEvent.press(pressable);
        expect(onPress).toHaveBeenCalled();
    });
});
