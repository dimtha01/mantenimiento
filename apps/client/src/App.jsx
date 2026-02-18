import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
      </Route>
    </Routes>
  )
}
