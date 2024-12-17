import { fireEvent, render } from "@testing-library/react-native";
import { SmashOrPass } from "@/src/components/SmashOrPass.jsx";

describe("SmashOrPass", () => {
    test("Renders correctly", () => {
        const tree = render(
            <SmashOrPass onSmash={() => {}} onPass={() => {}} />
        ).toJSON();

        expect(tree).toMatchSnapshot();
    });
    test("Can click on pass", () => {
        const fnOnSmash = jest.fn();
        const fnOnPass = jest.fn();
        const { getByTestId } = render(
            <SmashOrPass onSmash={fnOnSmash} onPass={fnOnPass} />
        );
        const pressable = getByTestId("SmashOrPass::Pass");
        fireEvent.press(pressable);

        expect(fnOnSmash).not.toHaveBeenCalled();
        expect(fnOnPass).toHaveBeenCalled();
    });
    test("Can click on smash", () => {
        const fnOnSmash = jest.fn();
        const fnOnPass = jest.fn();
        const { getByTestId } = render(
            <SmashOrPass onSmash={fnOnSmash} onPass={fnOnPass} />
        );
        const pressable = getByTestId("SmashOrPass::Smash");
        fireEvent.press(pressable);

        expect(fnOnSmash).toHaveBeenCalled();
        expect(fnOnPass).not.toHaveBeenCalled();
    });
});
