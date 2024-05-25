"use client";
import { builder, Builder } from "@builder.io/react";
import FeedbackForm from "@/components/FeedbackForm";
import Footer from "@/components/Footer";
import Header from "./components/Header";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(FeedbackForm, {
  name: "Feedback Form",
  inputs: [],
});

Builder.registerComponent(Footer, {
  name: "Footer",
  inputs: [],
});

Builder.registerComponent(Header, {
  name: "Header",
  inputs: [],
});
