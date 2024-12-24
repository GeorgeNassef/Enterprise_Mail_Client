#!/bin/bash

# Install TypeScript and type definitions
npm install --save-dev typescript @types/node @types/react @types/react-dom @types/jest
npm install --save-dev @types/react-router-dom @types/react-redux @types/react-virtualized

# Install React and core dependencies
npm install react react-dom react-router-dom

# Install Material-UI and icons
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# Install Redux and routing
npm install @reduxjs/toolkit react-redux

# Install form handling and validation
npm install formik yup

# Install date handling
npm install date-fns

# Install HTTP client
npm install axios

# Install development tools
npm install --save-dev eslint prettier eslint-config-prettier
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Create TypeScript configuration
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "es2015",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@pages/*": ["pages/*"],
      "@services/*": ["services/*"],
      "@store/*": ["store/*"],
      "@types/*": ["types/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
EOL

# Create ESLint configuration
cat > .eslintrc.json << EOL
{
  "extends": [
    "react-app",
    "react-app/jest",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
EOL

# Create Prettier configuration
cat > .prettierrc << EOL
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
EOL

# Create necessary directories
mkdir -p src/{components,pages,services,store/{slices,middleware},types,utils}

# Make the script executable
chmod +x install-deps.sh

echo "Dependencies installed and configuration files created successfully!"
