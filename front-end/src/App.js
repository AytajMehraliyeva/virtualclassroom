import { AppProvider } from './contexts/AppContext';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Router from './routing/Router';

const router=createBrowserRouter(Router)

function App() {
  return (
    <AppProvider>
   <RouterProvider router={router}/>

    </AppProvider>
  );
}

export default App;
