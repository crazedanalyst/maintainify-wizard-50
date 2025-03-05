
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';

const Accounts = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Management</h1>
        <p className="text-gray-500">Manage your account and subscription</p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500">Account management page coming soon in the next development phase.</p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Accounts;
