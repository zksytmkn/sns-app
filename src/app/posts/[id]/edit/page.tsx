import { getPost } from "@/actions/post";
import PostForm from "@/components/post-form";
import { notFound } from "next/navigation";

export default async function Page({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <PostForm editId={id} />;
}
