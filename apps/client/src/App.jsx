import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { HomePage } from './pages/HomePage';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
      </Route>
    </Routes>
  )
}
