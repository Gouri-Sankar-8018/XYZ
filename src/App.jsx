import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { SuppliersProvider } from './context/SuppliersContext'
import { ProductsProvider } from './context/ProductsContext'
import { InventoryProvider } from './context/InventoryContext'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import POS from './pages/POS'
import Suppliers from './pages/Suppliers'
import Reports from './pages/Reports'
import History from './pages/History'
import Settings from './pages/Settings'
import Products from './pages/Products'
import Orders from './pages/Orders'







function App() {
  return (
    <ThemeProvider>
      <SuppliersProvider>
        <ProductsProvider>
          <InventoryProvider>
            <Router>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/pos" element={<POS />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/orders" element={<Orders />} />
                  
                </Routes>
              </MainLayout>
            </Router>
          </InventoryProvider>
        </ProductsProvider>
      </SuppliersProvider>
    </ThemeProvider>
  )
}

export default App
