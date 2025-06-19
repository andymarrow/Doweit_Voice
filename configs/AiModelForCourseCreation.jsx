/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 */

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.NEXT_PUBLIC_GEMNI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  

    export const GenerateCourseLayout_AI = model.startChat({
      generationConfig,
   // safetySettings: Adjust safety settings
   // See https://ai.google.dev/gemini-api/docs/safety-settings
      history: [
        {
          role: "user",
          parts: [
            {text: "Generate A Course Tutorial on Following Detail With field as Course Name,Description,Along with Chapter Name,about,Duration: Category: \"Programming\", Topic : Python , Level:Basic ,Duration: 1 hours, NoOfChapters:5 , in JSON format"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"course\": {\n    \"name\": \"Python Fundamentals\",\n    \"description\": \"This course provides a comprehensive introduction to Python programming, covering the essential concepts and syntax. You'll learn how to write basic Python programs, understand data types, control flow, functions, and more.\",\n    \"chapters\": [\n      {\n        \"name\": \"Introduction to Python\",\n        \"about\": \"This chapter introduces the Python programming language, its history, and its applications. You'll learn how to set up your development environment and write your first Python program.\",\n        \"duration\": \"20 minutes\"\n      },\n      {\n        \"name\": \"Data Types and Variables\",\n        \"about\": \"This chapter covers fundamental data types in Python, including integers, floats, strings, and booleans. You'll learn how to declare variables and assign values to them.\",\n        \"duration\": \"20 minutes\"\n      },\n      {\n        \"name\": \"Operators and Expressions\",\n        \"about\": \"This chapter explores various operators in Python, such as arithmetic, comparison, logical, and bitwise operators. You'll learn how to build expressions and evaluate them.\",\n        \"duration\": \"15 minutes\"\n      },\n      {\n        \"name\": \"Control Flow Statements\",\n        \"about\": \"This chapter introduces control flow statements in Python, including if-else, for loops, and while loops. You'll learn how to control the execution of your programs based on conditions.\",\n        \"duration\": \"10 minutes\"\n      },\n      {\n        \"name\": \"Functions and Modules\",\n        \"about\": \"This chapter explains functions and modules in Python. You'll learn how to define and call functions to reuse code and organize your programs. You'll also explore how to import modules to extend functionality.\",\n        \"duration\": \"5 minutes\"\n      }\n    ],\n    \"category\": \"Programming\",\n    \"topic\": \"Python\",\n    \"level\": \"Basic\",\n    \"duration\": \"1 hour\",\n    \"noOfChapters\": 5\n  }\n}\n```"},
          ],
        },
      ],
    });
  

    export const GenerateChapterContent_AI = model.startChat({
      generationConfig,
   // safetySettings: Adjust safety settings
   // See https://ai.google.dev/gemini-api/docs/safety-settings
      history: [
        {
          role: "user",
          parts: [
            {text: "Explain the concept in Detail on Topic: Learing Mysql, Chapter: Getting Started with the new course , in JSON Format with list of array with fields as title, description in detail, Code Example (Code field in <precode> format) if applicable"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n[\n  {\n    \"title\": \"What is MySQL?\",\n    \"description\": \"MySQL is a powerful and popular open-source relational database management system (RDBMS). It's widely used for storing, managing, and retrieving data in various applications. Here's a breakdown of its key features:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Key Features of MySQL\",\n    \"description\": \"MySQL excels in numerous areas:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Relational Database Model\",\n    \"description\": \"MySQL operates based on the relational database model. Data is organized into tables, with rows representing records and columns representing data fields. Relationships are established between tables to link related data.\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Structured Query Language (SQL)\",\n    \"description\": \"SQL is the standard language for interacting with relational databases like MySQL. You use SQL to define, manipulate, and retrieve data. It's a versatile and powerful tool.\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Why Learn MySQL?\",\n    \"description\": \"Learning MySQL is beneficial for various reasons:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Course Overview\",\n    \"description\": \"This course will guide you through the fundamentals of MySQL. You'll learn how to:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Prerequisites\",\n    \"description\": \"To get the most out of this course, you'll benefit from:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Setting up Your Environment\",\n    \"description\": \"To start working with MySQL, you need to install and configure a MySQL environment. There are multiple options:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Connecting to MySQL\",\n    \"description\": \"Once your environment is set up, you can connect to your MySQL server using a client tool. Here are some common choices:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Navigating the MySQL Shell\",\n    \"description\": \"The MySQL shell provides a command-line interface for interacting with the database. You'll use various commands to manage and query data.\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Exploring MySQL Concepts\",\n    \"description\": \"This section covers core MySQL concepts that are essential for understanding how databases function:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Working with Databases and Tables\",\n    \"description\": \"You'll learn how to create, alter, and manage databases and tables in MySQL:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Data Types\",\n    \"description\": \"MySQL offers a variety of data types to store different kinds of information effectively:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Data Manipulation Language (DML)\",\n    \"description\": \"DML is a set of SQL commands used to modify and retrieve data within tables:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Data Definition Language (DDL)\",\n    \"description\": \"DDL commands are used to define and manage the structure of your database:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Constraints\",\n    \"description\": \"Constraints help maintain data integrity and enforce rules on your database:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Indexes\",\n    \"description\": \"Indexes improve query performance by providing quick access to specific data:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Relationships\",\n    \"description\": \"Understanding relationships is crucial for connecting data across tables:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Transactions\",\n    \"description\": \"Transactions ensure data consistency and integrity during multiple database operations:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Security\",\n    \"description\": \"Protecting your database is essential. This section explores:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Advanced Topics\",\n    \"description\": \"As you progress, you'll explore more advanced MySQL concepts, such as:\",\n    \"code\": \"\"\n  },\n  {\n    \"title\": \"Putting It All Together: Practical Examples\",\n    \"description\": \"To solidify your understanding, you'll work through various practical examples and projects. This will allow you to apply your knowledge in real-world scenarios:\",\n    \"code\": \"\"\n  }\n]\n```"},
          ],
        },
      ],
    });



    // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // console.log(result.response.text());
  