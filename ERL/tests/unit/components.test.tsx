import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmergencyNumber } from "@/components/EmergencyNumber";
import { SOSButton } from "@/components/SOSButton";
import { Badge } from "@/components/ui/badge";

describe("EmergencyNumber", () => {
  it("renders the country-specific emergency number", () => {
    render(
      <EmergencyNumber
        entry={{ country: "India", number: "112", iso: "IN" }}
        countryName="India"
      />
    );
    expect(screen.getByText("112")).toBeInTheDocument();
    expect(screen.getByText(/Detected in India/i)).toBeInTheDocument();
  });

  it("includes a tel: anchor for one-tap calling", () => {
    render(
      <EmergencyNumber
        entry={{ country: "USA", number: "911", iso: "US" }}
        countryName="USA"
      />
    );
    const link = screen.getByRole("link", { name: /call 911/i });
    expect(link.getAttribute("href")).toBe("tel:911");
  });
});

describe("SOSButton", () => {
  it("renders the SOS affordance and is keyboard-accessible", () => {
    render(<SOSButton />);
    const button = screen.getByRole("button", { name: /sos/i });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
  });
});

describe("Badge", () => {
  it("applies variant styles", () => {
    const { container } = render(<Badge variant="green">Fastest</Badge>);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("bg-green");
  });
});
