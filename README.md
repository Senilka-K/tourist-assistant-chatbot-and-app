# Tourist Assistant Chatbot and App

Welcome to the Tourist Assistant Chatbot and App, a comprehensive solution designed to enhance the travel experience for tourists. This application features a multilingual chatbot for easy communication and an emergency response feature for urgent needs.

## Features

- **Multilingual Chatbot**: Allows tourists to interact in their native language.
- **Emergency Response**: Provides quick access to emergency services.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following tools installed:
- Node.js
- npm (Node Package Manager)
- Expo CLI for running the mobile app

```
npm install -g expo-cli
```

### Installation

1. **Clone the Repository**

   Start by cloning the repository to your local machine:

   ```
   git clone <repository-url>
   cd tourist-assistant-chatbot-and-app
   ```

   Replace <repository-url> with the actual URL of the repository.

2. **Backend Setup**

   Navigate to the Backend directory, copy the example environment file, and set up the environment:

   ```
   cd Backend
   cp .env.example .env
   nano .env  # Edit the .env file with the required secrets
   npm install
   node server.js
   ```

3. **Mobile App Setup**

   Prepare and run the mobile application:

   ```
   cd ../MobileApp
   cp .env.example .env
   npm install
   npx expo start
   ```

   Use Expo to access the app on your device or emulator.

4. **Chatbot**

   See Jupyter Notebook for the chatbot:

   Execute each cell within the Jupitor Notebook.
   Last cell will trigger chatbot
