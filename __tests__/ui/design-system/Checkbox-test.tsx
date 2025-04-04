import { render } from "@testing-library/react-native";

import { Checkbox } from "@/src/ui/design-system/Checkbox";

describe("Checkbox", () => {
  it("renders correctly", () => {
    const tree = render(<Checkbox checked={false} />).toJSON();
    expect(tree).toMatchInlineSnapshot(`
      <View>
        <Text>
          circle-outline
        </Text>
      </View>
    `);
  });

  it("renders correctly when checked", () => {
    const tree = render(<Checkbox checked={true} />).toJSON();
    expect(tree).toMatchInlineSnapshot(`
      <View>
        <Text>
          check-circle
        </Text>
      </View>
    `);
  });
});
