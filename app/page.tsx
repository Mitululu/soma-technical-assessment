"use client"
import { Todo } from '@prisma/client';
import { useState, useEffect } from 'react';

async function getPexelsImage(title:string, id:string) {
  try {
    console.log("loading image for " + title);
    const response = await fetch(`https://api.pexels.com/v1/search?query=${title}&per_page=1`, {
      headers: {
        Authorization: process.env.PEXELS_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.statusText}`);
    }

    const data = await response.json();
    const imageElement = document.getElementById(id+"-img") as HTMLImageElement;
    const loadElement = document.getElementById(id+"-loading") as HTMLSpanElement;

    if (imageElement && loadElement) {
      imageElement.src = data.photos[0].src.small;
      loadElement.style.display = 'none';
    }
    
    return;
  } catch (error) {
    console.error("Error fetching image:", error);
    return;
  }
}

export default function Home() {
  const [newTodo, setNewTodo] = useState('');
  const [newDate, setNewDate] = useState(new Date());
  const [depends, setDepends] = useState([]);
  const [todos, setTodos] = useState([]);
  const currentDate = (new Date()).toLocaleDateString("en-us");

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    fetchTodoImages();
  }, [todos]);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  const fetchTodoImages = async () => {
    try {
      todos.map((todo:Todo) => getPexelsImage(todo.title, todo.id));
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  }

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo, date: newDate, depends: depends }),
      });
      setNewTodo('');
      setNewDate(new Date());
      setDepends([]);
      fetchTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleDeleteTodo = async (id:any) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Things To Do App</h1>
        <div className="flex mb-6">
          <input
            type="text"
            className="flex-grow p-3 rounded-l-full focus:outline-none text-gray-700"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          
          />
          <input type="date" onChange={(e) => setNewDate(new Date(e.target.value))} />
          <select multiple id="dependency-select">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
          <button
            onClick={handleAddTodo}
            className="bg-white text-indigo-600 p-3 rounded-r-full hover:bg-gray-100 transition duration-300"
          >
            Add
          </button>
        </div>
        <ul>
          {todos.map((todo:Todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center bg-white bg-opacity-90 p-4 mb-4 rounded-lg shadow-lg"
            >
              <span className="text-gray-800">{todo.title}</span>
              <span className={currentDate > (new Date(todo.date)).toLocaleDateString("en-us") ? "text-red-500" : "text-gray-800"}>
                {todo.date ? (new Date(todo.date)).toLocaleDateString("en-us") : ""}
              </span>
              <span id={todo.id+"-loading"} className="text-gray-800">loading</span>
              <img id={todo.id + "-img"} />
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 transition duration-300"
              >
                {/* Delete Icon */}
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
