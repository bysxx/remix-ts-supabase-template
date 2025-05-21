import { type ActionFunctionArgs, data } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { supabase } from "~/lib/supabase";
import type { Todo } from "~/types/todo";

export async function loader() {
  try {
    const { data: todos, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Failed to fetch todos");
    }

    return data({ todos });
  } catch (error) {
    console.error(error);
    return data({ todos: [] });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const intent = formData.get("intent") as string;
  const id = formData.get("id") as string;

  if (intent === "create") {
    if (!title) {
      return data({ error: "제목을 입력해주세요" }, { status: 400 });
    }

    const { error } = await supabase.from("todos").insert([
      {
        title,
        completed: false,
      },
    ]);

    if (error) {
      return data({ error: "Todo 추가에 실패했습니다" }, { status: 500 });
    }
  }

  if (intent === "toggle") {
    const { data: todo } = await supabase
      .from("todos")
      .select("completed")
      .eq("id", id)
      .single();

    if (todo) {
      const { error } = await supabase
        .from("todos")
        .update({ completed: !todo.completed })
        .eq("id", id);

      if (error) {
        return data({ error: "상태 변경에 실패했습니다" }, { status: 500 });
      }
    }
  }

  if (intent === "delete") {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      return data({ error: "삭제에 실패했습니다" }, { status: 500 });
    }
  }

  return data({ success: true });
}

export default function Todos() {
  const { todos } = useLoaderData<{ todos: Todo[] }>();
  const actionData = useActionData<{ error?: string; success?: boolean }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            TODO
          </h1>
        </div>

        <Form method="post" className="mb-12">
          <input type="hidden" name="intent" value="create" />
          <div className="flex gap-3">
            <input
              type="text"
              name="title"
              placeholder="새로운 할 일을 입력하세요"
              className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-purple-500/25"
            >
              추가
            </button>
          </div>
          {actionData?.error && (
            <p className="mt-3 text-red-400 text-sm">{actionData.error}</p>
          )}
        </Form>

        <div className="space-y-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center justify-between p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <Form method="post">
                  <input type="hidden" name="intent" value="toggle" />
                  <input type="hidden" name="id" value={todo.id} />
                  <button
                    type="submit"
                    className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-purple-500 hover:border-purple-400 transition-colors duration-200"
                  >
                    {todo.completed && (
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                    )}
                  </button>
                </Form>
                <span
                  className={`text-lg ${
                    todo.completed
                      ? "line-through text-gray-500"
                      : "text-gray-200"
                  }`}
                >
                  {todo.title}
                </span>
              </div>
              <Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={todo.id} />
                <button
                  type="submit"
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </Form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
