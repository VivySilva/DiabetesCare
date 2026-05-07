"use client";

import React from 'react';
import ForumPostScreen from "@/components/features/forum/ForumPostScreen";

export default function PatientForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <ForumPostScreen id={id} role="patient" />;
}
