"use client";
import { builder, Builder } from "@builder.io/react";
import FeedbackForm from "./components/FeedbackForm/FeedbackForm";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(FeedbackForm, {
  name: "Feedback Form",
  inputs: [],
});
