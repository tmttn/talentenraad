"use client";
import { builder, Builder } from "@builder.io/react";
import { Header, Footer, FeedbackForm } from "@components/index"

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(Footer, {
  name: "Footer",
  inputs: [
    {
      name: "navigation",
      type: "reference",
      model: "grouped-navigation-links",
      required: true,
    },
  ],
});

Builder.registerComponent(FeedbackForm, {
  name: "FeedbackForm",
});

Builder.registerComponent(Header, {
  name: "Header",
  inputs: [
    {
      name: "navigation",
      type: "reference",
      model: "navigation-links",
      required: true,
    },
  ],
});
