"use client";

export type ModelOption = {
  key: string;
  name: string;
  provider: string;
  tags: string[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ModelPicker(_props: {
  models: ModelOption[];
  selected: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  return null;
}
