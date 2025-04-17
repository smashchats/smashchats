import { render } from "@testing-library/react-native";
import { AvatarFallbackText } from "@/src/ui/design-system/Avatar";

describe("AvatarFallbackText", () => {
    test("Renders correctly", () => {
        const tree = render(<AvatarFallbackText name="test" />).toJSON();

        expect(tree).toMatchInlineSnapshot(`
      <View
        style={
          {
            "alignItems": "center",
            "height": "100%",
            "justifyContent": "center",
            "width": "100%",
          }
        }
      >
        <Text
          style={
            {
              "color": "white",
              "fontSize": 24,
              "fontWeight": "bold",
            }
          }
        >
          T
        </Text>
      </View>
    `);
    });

    test("Renders correctly with no name", () => {
        const tree = render(
            <AvatarFallbackText name={undefined as unknown as string} />
        ).toJSON();

        expect(tree).toMatchInlineSnapshot(`
      <View
        style={
          {
            "alignItems": "center",
            "height": "100%",
            "justifyContent": "center",
            "width": "100%",
          }
        }
      >
        <Text
          style={
            {
              "color": "white",
              "fontSize": 24,
              "fontWeight": "bold",
            }
          }
        />
      </View>
    `);
    });

    test("Renders initials correctly", () => {
        const { getByText } = render(<AvatarFallbackText name="John Doe" />);

        expect(getByText("JD")).toBeTruthy();
    });
});
