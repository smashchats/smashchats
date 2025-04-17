import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { MessageInput } from "@/src/components/MessageInput";

describe("MessageInput", () => {
    const defaultProps = {
        newMessage: "",
        setNewMessage: jest.fn(),
        onSendMessage: jest.fn(),
        onSendMedia: jest.fn(),
        onCollapse: jest.fn(),
        isRecording: false,
        recordingDuration: 0,
        onStartRecording: jest.fn(),
        onStopRecording: jest.fn(),
        shouldShowSendIcon: true,
        footerHeight: 60,
        insets: { bottom: 0 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders correctly with default props", () => {
        const { getByPlaceholderText, getByTestId } = render(
            <MessageInput {...defaultProps} />
        );

        expect(getByPlaceholderText("Share something...")).toBeTruthy();
        expect(getByTestId("attachment-button")).toBeTruthy();
        expect(getByTestId("send-button")).toBeTruthy();
    });

    it("calls setNewMessage when text input changes", () => {
        const { getByPlaceholderText } = render(
            <MessageInput {...defaultProps} />
        );

        fireEvent.changeText(
            getByPlaceholderText("Share something..."),
            "Hello world"
        );

        expect(defaultProps.setNewMessage).toHaveBeenCalledWith("Hello world");
    });

    it("calls onSendMessage when send button is pressed", () => {
        const { getByTestId } = render(<MessageInput {...defaultProps} />);

        fireEvent.press(getByTestId("send-button"));

        expect(defaultProps.onSendMessage).toHaveBeenCalled();
    });

    it("calls onSendMedia when attachment button is pressed", () => {
        const { getByTestId } = render(<MessageInput {...defaultProps} />);

        fireEvent.press(getByTestId("attachment-button"));

        expect(defaultProps.onSendMedia).toHaveBeenCalled();
    });

    it("calls onCollapse when input is focused", () => {
        const { getByPlaceholderText } = render(
            <MessageInput {...defaultProps} />
        );

        fireEvent(getByPlaceholderText("Share something..."), "focus");

        expect(defaultProps.onCollapse).toHaveBeenCalled();
    });

    it("shows microphone button when shouldShowSendIcon is false", () => {
        const props = { ...defaultProps, shouldShowSendIcon: false };
        const { getByTestId, queryByTestId } = render(
            <MessageInput {...props} />
        );

        expect(queryByTestId("send-button")).toBeNull();
        expect(getByTestId("microphone-button")).toBeTruthy();
    });

    it("shows recording duration when isRecording is true", () => {
        const props = {
            ...defaultProps,
            shouldShowSendIcon: false,
            isRecording: true,
            recordingDuration: 65, // 1:05
        };
        const { getByText } = render(<MessageInput {...props} />);

        expect(getByText("1:05")).toBeTruthy();
    });

    it("calls onStartRecording when microphone button is pressed", () => {
        const props = { ...defaultProps, shouldShowSendIcon: false };
        const { getByTestId } = render(<MessageInput {...props} />);

        fireEvent(getByTestId("microphone-button"), "pressIn");

        expect(props.onStartRecording).toHaveBeenCalled();
    });

    it("calls onStopRecording when microphone button is released", () => {
        const props = { ...defaultProps, shouldShowSendIcon: false };
        const { getByTestId } = render(<MessageInput {...props} />);

        fireEvent(getByTestId("microphone-button"), "pressOut");

        expect(props.onStopRecording).toHaveBeenCalled();
    });

    it("calls onSendMessage when text input is submitted", () => {
        const { getByPlaceholderText } = render(
            <MessageInput {...defaultProps} />
        );

        fireEvent(getByPlaceholderText("Share something..."), "submitEditing");

        expect(defaultProps.onSendMessage).toHaveBeenCalled();
    });

    it("applies correct styles based on insets", () => {
        const props = {
            ...defaultProps,
            insets: { bottom: 34 }, // iPhone with home indicator
        };
        const { getByTestId } = render(<MessageInput {...props} />);

        const container = getByTestId("message-input-container");
        expect(container.props.style).toMatchObject({
            height: 994, // footerHeight + insets.bottom + 900
            bottom: -4, // -insets.bottom + 30
        });
    });
});
