"use client";

import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Welcome to AG UI!");
  const [counter, setCounter] = useState(0);

  // Make state readable by the agent
  useCopilotReadable({
    description: "The current message displayed on the screen",
    value: message,
  });

  useCopilotReadable({
    description: "The current counter value",
    value: counter,
  });

  // Define actions the agent can perform
  useCopilotAction({
    name: "updateMessage",
    description: "Update the message displayed on the screen",
    parameters: [
      {
        name: "newMessage",
        type: "string",
        description: "The new message to display",
        required: true,
      },
    ],
    handler: async ({ newMessage }) => {
      setMessage(newMessage);
      return { success: true, message: `Message updated to: ${newMessage}` };
    },
  });

  useCopilotAction({
    name: "incrementCounter",
    description: "Increment the counter by a specified amount",
    parameters: [
      {
        name: "amount",
        type: "number",
        description: "The amount to increment the counter by",
        required: false,
      },
    ],
    handler: async ({ amount = 1 }) => {
      setCounter(prev => prev + amount);
      return { success: true, newValue: counter + amount };
    },
  });

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            AG UI Demo Application
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Agent-User Interaction Protocol in Action
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Message Display Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Dynamic Message
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ask the agent to update this message!
            </p>
          </div>

          {/* Counter Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Interactive Counter
            </h2>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {counter}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setCounter(prev => prev + 1)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                +1
              </button>
              <button
                onClick={() => setCounter(prev => prev - 1)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                -1
              </button>
              <button
                onClick={() => setCounter(0)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">
            Try These Agent Commands:
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>• &quot;Update the message to say Hello AG UI!&quot;</li>
            <li>• &quot;Increment the counter by 5&quot;</li>
            <li>• &quot;What&apos;s the current counter value?&quot;</li>
            <li>• &quot;Change the message to something inspiring&quot;</li>
          </ul>
        </div>

        {/* AG UI Features */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="text-center p-4">
            <div className="text-3xl mb-2">💬</div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Real-time Chat</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Streaming agent responses
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🔄</div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">State Sync</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Bi-directional updates
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🧩</div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Generative UI</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Dynamic interfaces
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}