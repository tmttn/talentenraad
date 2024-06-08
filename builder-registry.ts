"use client";
import { builder, Builder } from "@builder.io/react";
import FeedbackForm from "./app/components/FeedbackForm";
import Footer from "./app/components/Footer";
import Header from "./app/components/Header";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(Footer, {
  name: "Footer",
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
    },
  ],
});
