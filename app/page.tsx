"use client";
import { CopilotKit, useCoAgent, useCopilotAction, useCopilotChat } from "@copilotkit/react-core";
import { CopilotChat, CopilotSidebar } from "@copilotkit/react-ui";
import React, { useState, useEffect, useRef } from "react";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";
import "@copilotkit/react-ui/styles.css";
import "./recipe.css";
import { useMobileView } from "@/utils/use-mobile-view";
import { useMobileChat } from "@/utils/use-mobile-chat";

export default function HomePage() {
  const { isMobile } = useMobileView();
  const defaultChatHeight = 50
  const {
    isChatOpen,
    setChatHeight,
    setIsChatOpen,
    isDragging,
    chatHeight,
    handleDragStart
  } = useMobileChat(defaultChatHeight)

  const chatTitle = 'AI Recipe Assistant'
  const chatDescription = 'Ask me to craft recipes'
  const initialLabel = 'Hi 👋 How can I help with your recipe?'

  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      showDevConsole={false}
    >
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={
          {
            backgroundImage: "url('/shared_state_background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          } as React.CSSProperties
        }
      >
        <Recipe />
        {isMobile ? (
          <>
            {/* Chat Toggle Button */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <div className="bg-gradient-to-t from-white via-white to-transparent h-6"></div>
              <div
                className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between cursor-pointer shadow-lg"
                onClick={() => {
                  if (!isChatOpen) {
                    setChatHeight(defaultChatHeight); // Reset to good default when opening
                  }
                  setIsChatOpen(!isChatOpen);
                }}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium text-gray-900">{chatTitle}</div>
                    <div className="text-sm text-gray-500">{chatDescription}</div>
                  </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isChatOpen ? 'rotate-180' : ''}`}>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pull-Up Chat Container */}
            <div
              className={`fixed inset-x-0 bottom-0 z-40 bg-white rounded-t-2xl shadow-[0px_0px_20px_0px_rgba(0,0,0,0.15)] transform transition-all duration-300 ease-in-out flex flex-col ${
                isChatOpen ? 'translate-y-0' : 'translate-y-full'
              } ${isDragging ? 'transition-none' : ''}`}
              style={{
                height: `${chatHeight}vh`,
                paddingBottom: 'env(safe-area-inset-bottom)' // Handle iPhone bottom padding
              }}
            >
              {/* Drag Handle Bar */}
              <div
                className="flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing"
                onMouseDown={handleDragStart}
              >
                <div className="w-12 h-1 bg-gray-400 rounded-full hover:bg-gray-500 transition-colors"></div>
              </div>

              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{chatTitle}</h3>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Chat Content - Flexible container for messages and input */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden pb-16">
                <CopilotChat
                  className="h-full flex flex-col"
                  labels={{
                    initial: initialLabel,
                  }}
                />
              </div>
            </div>

            {/* Backdrop */}
            {isChatOpen && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsChatOpen(false)}
              />
            )}
          </>
        ) : (
          <CopilotSidebar
            defaultOpen={true}
            labels={{
              title: chatTitle,
              initial: initialLabel,
            }}
            clickOutsideToClose={false}
          />
        )}
      </div>
    </CopilotKit>
  );
}

enum SkillLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
}

enum CookingTime {
  FiveMin = "5 min",
  FifteenMin = "15 min",
  ThirtyMin = "30 min",
  FortyFiveMin = "45 min",
  SixtyPlusMin = "60+ min",
}

const cookingTimeValues = [
  { label: CookingTime.FiveMin, value: 0 },
  { label: CookingTime.FifteenMin, value: 1 },
  { label: CookingTime.ThirtyMin, value: 2 },
  { label: CookingTime.FortyFiveMin, value: 3 },
  { label: CookingTime.SixtyPlusMin, value: 4 },
];

const dietaryOptions = [
  "Vegetarian",
  "Nut-free",
  "Dairy-free",
  "Gluten-free",
  "Vegan",
  "Low-carb"
];

interface Ingredient {
  icon: string;
  name: string;
  amount: string;
}

interface Recipe {
  title: string;
  skill_level: SkillLevel;
  cooking_time: CookingTime;
  dietary_preferences: string[];
  ingredients: Ingredient[];
  instructions: string[];
}

interface RecipeAgentState {
  recipe: Recipe;
}

const INITIAL_STATE: RecipeAgentState = {
  recipe: {
    title: "Make Your Recipe",
    skill_level: SkillLevel.INTERMEDIATE,
    cooking_time: CookingTime.FortyFiveMin,
    dietary_preferences: [],
    ingredients: [
      { icon: "🥕", name: "Carrots", amount: "3 large, grated" },
      { icon: "🌾", name: "All-Purpose Flour", amount: "2 cups" },
    ],
    instructions: ["Preheat oven to 350°F (175°C)"],
  },
};

function Recipe() {
  const { state: agentState, setState: setAgentState } = useCoAgent<RecipeAgentState>({
    name: "recipe_assistant",
    initialState: INITIAL_STATE,
  });

  useCopilotAction({
    name: "generate_recipe",
    description: `Generate a recipe based on the user's input based on the ingredients and instructions, proceed with the recipe to finish it. The existing ingredients and instructions are provided to you as context: ${JSON.stringify(agentState)}. If you have just created or modified the recipe, just answer in one sentence what you did. dont describe the recipe, just say what you did`,
    parameters: [
      {
        name: "recipe",
        type: "object",
        attributes: [
          {
            name: "title",
            type: "string",
            description: "The title of the recipe"
          },
          {
            name: "skill_level",
            type: "string",
            description: "The skill level of the recipe",
            enum: Object.values(SkillLevel)
          },
          {
            name: "cooking_time",
            type: "string",
            description: "The cooking time of the recipe",
            enum: Object.values(CookingTime)
          },
          {
            name: "dietary_preferences",
            type: "string[]",
            enum: dietaryOptions
          },
          {
            name: "ingredients",
            type: "object[]",
            attributes: [
              {
                name: "icon",
                type: "string",
                description: "The icon of the ingredient"
              },
              {
                name: "name",
                type: "string",
                description: "The name of the ingredient"
              },
              {
                name: "amount",
                type: "string",
                description: "The amount of the ingredient"
              }
            ]
          },
          {
            name: "instructions",
            type: "string[]",
            description: "The instructions of the recipe"
          }
        ]
      }
    ],
    render: ({args}) => {
      useEffect(() => {
        console.log(args, "args.recipe")
        updateRecipe(args?.recipe || {})
      }, [args.recipe])
      return <></>
    }
  })

  const [recipe, setRecipe] = useState(INITIAL_STATE.recipe);
  const { appendMessage, isLoading } = useCopilotChat();
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null);
  const newInstructionRef = useRef<HTMLTextAreaElement>(null);

  const updateRecipe = (partialRecipe: Partial<Recipe>) => {
    setAgentState({
      ...agentState,
      recipe: {
        ...recipe,
        ...partialRecipe,
      },
    });
    setRecipe({
      ...recipe,
      ...partialRecipe,
    });
  };

  const newRecipeState = { ...recipe };
  const newChangedKeys = [];
  const changedKeysRef = useRef<string[]>([]);

  for (const key in recipe) {
    if (
      agentState &&
      agentState.recipe &&
      (agentState.recipe as any)[key] !== undefined &&
      (agentState.recipe as any)[key] !== null
    ) {
      let agentValue = (agentState.recipe as any)[key];
      const recipeValue = (recipe as any)[key];

      // Check if agentValue is a string and replace \n with actual newlines
      if (typeof agentValue === "string") {
        agentValue = agentValue.replace(/\\n/g, "\n");
      }

      if (JSON.stringify(agentValue) !== JSON.stringify(recipeValue)) {
        (newRecipeState as any)[key] = agentValue;
        newChangedKeys.push(key);
      }
    }
  }

  if (newChangedKeys.length > 0) {
    changedKeysRef.current = newChangedKeys;
  } else if (!isLoading) {
    changedKeysRef.current = [];
  }

  useEffect(() => {
    setRecipe(newRecipeState);
  }, [JSON.stringify(newRecipeState)]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateRecipe({
      title: event.target.value,
    });
  };

  const handleSkillLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateRecipe({
      skill_level: event.target.value as SkillLevel,
    });
  };

  const handleDietaryChange = (preference: string, checked: boolean) => {
    if (checked) {
      updateRecipe({
        dietary_preferences: [...recipe.dietary_preferences, preference],
      });
    } else {
      updateRecipe({
        dietary_preferences: recipe.dietary_preferences.filter((p) => p !== preference),
      });
    }
  };

  const handleCookingTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateRecipe({
      cooking_time: cookingTimeValues[Number(event.target.value)].label,
    });
  };

  const addIngredient = () => {
    // Pick a random food emoji from our valid list
    updateRecipe({
      ingredients: [...recipe.ingredients, { icon: "🍴", name: "", amount: "" }],
    });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    updateRecipe({ ingredients: updatedIngredients });
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients.splice(index, 1);
    updateRecipe({ ingredients: updatedIngredients });
  };

  const addInstruction = () => {
    const newIndex = recipe.instructions.length;
    updateRecipe({
      instructions: [...recipe.instructions, ""],
    });
    // Set the new instruction as the editing one
    setEditingInstructionIndex(newIndex);

    // Focus the new instruction after render
    setTimeout(() => {
      const textareas = document.querySelectorAll(".instructions-container textarea");
      const newTextarea = textareas[textareas.length - 1] as HTMLTextAreaElement;
      if (newTextarea) {
        newTextarea.focus();
      }
    }, 50);
  };

  const updateInstruction = (index: number, value: string) => {
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions[index] = value;
    updateRecipe({ instructions: updatedInstructions });
  };

  const removeInstruction = (index: number) => {
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions.splice(index, 1);
    updateRecipe({ instructions: updatedInstructions });
  };

  // Simplified icon handler that defaults to a fork/knife for any problematic icons
  const getProperIcon = (icon: string | undefined): string => {
    // If icon is undefined  return the default
    if (!icon) {
      return "🍴";
    }

    return icon;
  };

  return (
    <form className="recipe-card">
      {/* Recipe Title */}
      <div className="recipe-header">
        <input
          type="text"
          value={recipe.title || ""}
          onChange={handleTitleChange}
          className="recipe-title-input"
        />

        <div className="recipe-meta">
          <div className="meta-item">
            <span className="meta-icon">🕒</span>
            <select
              className="meta-select"
              value={cookingTimeValues.find((t) => t.label === recipe.cooking_time)?.value || 3}
              onChange={handleCookingTimeChange}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0px center",
                backgroundSize: "12px",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              {cookingTimeValues.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>

          <div className="meta-item">
            <span className="meta-icon">🏆</span>
            <select
              className="meta-select"
              value={recipe.skill_level}
              onChange={handleSkillLevelChange}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0px center",
                backgroundSize: "12px",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              {Object.values(SkillLevel).map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="section-container relative">
        {changedKeysRef.current.includes("dietary_preferences") && <Ping />}
        <h2 className="section-title">Dietary Preferences</h2>
        <div className="dietary-options">
          {dietaryOptions.map((option) => (
            <label key={option} className="dietary-option">
              <input
                type="checkbox"
                checked={recipe.dietary_preferences.includes(option)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleDietaryChange(option, e.target.checked)
                }
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="section-container relative">
        {changedKeysRef.current.includes("ingredients") && <Ping />}
        <div className="section-header">
          <h2 className="section-title">Ingredients</h2>
          <button type="button" className="add-button" onClick={addIngredient}>
            + Add Ingredient
          </button>
        </div>
        <div className="ingredients-container">
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-card">
              <div className="ingredient-icon">{getProperIcon(ingredient.icon)}</div>
              <div className="ingredient-content">
                <input
                  type="text"
                  value={ingredient.name || ""}
                  onChange={(e) => updateIngredient(index, "name", e.target.value)}
                  placeholder="Ingredient name"
                  className="ingredient-name-input"
                />
                <input
                  type="text"
                  value={ingredient.amount || ""}
                  onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                  placeholder="Amount"
                  className="ingredient-amount-input"
                />
              </div>
              <button
                type="button"
                className="remove-button"
                onClick={() => removeIngredient(index)}
                aria-label="Remove ingredient"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="section-container relative">
        {changedKeysRef.current.includes("instructions") && <Ping />}
        <div className="section-header">
          <h2 className="section-title">Instructions</h2>
          <button type="button" className="add-step-button" onClick={addInstruction}>
            + Add Step
          </button>
        </div>
        <div className="instructions-container">
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="instruction-item">
              {/* Number Circle */}
              <div className="instruction-number">{index + 1}</div>

              {/* Vertical Line */}
              {index < recipe.instructions.length - 1 && <div className="instruction-line" />}

              {/* Instruction Content */}
              <div
                className={`instruction-content ${
                  editingInstructionIndex === index
                    ? "instruction-content-editing"
                    : "instruction-content-default"
                }`}
                onClick={() => setEditingInstructionIndex(index)}
              >
                <textarea
                  className="instruction-textarea"
                  value={instruction || ""}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder={!instruction ? "Enter cooking instruction..." : ""}
                  onFocus={() => setEditingInstructionIndex(index)}
                  onBlur={(e) => {
                    // Only blur if clicking outside this instruction
                    if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) {
                      setEditingInstructionIndex(null);
                    }
                  }}
                />

                {/* Delete Button (only visible on hover) */}
                <button
                  type="button"
                  className={`instruction-delete-btn ${
                    editingInstructionIndex === index
                      ? "instruction-delete-btn-editing"
                      : "instruction-delete-btn-default"
                  } remove-button`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent onClick
                    removeInstruction(index);
                  }}
                  aria-label="Remove instruction"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improve with AI Button */}
      <div className="action-container">
        <button
          className={isLoading ? "improve-button loading" : "improve-button"}
          type="button"
          onClick={() => {
            if (!isLoading) {
              appendMessage(
                new TextMessage({
                  content: "Improve the recipe",
                  role: Role.User,
                }),
              );
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? "Please Wait..." : "Improve with AI"}
        </button>
      </div>
    </form>
  );
}

function Ping() {
  return (
    <span className="ping-animation">
      <span className="ping-circle"></span>
      <span className="ping-dot"></span>
    </span>
  );
}