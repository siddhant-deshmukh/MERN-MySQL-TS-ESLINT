import type { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import ProductManagement from './ProductList';
import OrderManagement from './OrderList';
import { TbRefresh } from "react-icons/tb";
import DashboardTab from './DashboardTab';

function MainAppSection() {
  const authUser = useSelector((state: RootState) => state.user.authUser);
  const handleRefreshData = () => {

  }

  if (!authUser) return <div></div>;
  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Welcome, {authUser.username}!</h1>
        {/* <div className="flex space-x-4">
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div> */}
      </div>

      <Tabs defaultValue="products" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>
          <Button onClick={handleRefreshData} variant="secondary">
            < TbRefresh />
          </Button>
        </div>

        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>
        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
        <TabsContent value="dashboard"> {/* New Dashboard Content */}
          <DashboardTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}



export default MainAppSection
