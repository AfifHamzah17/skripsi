// src/pages/views/admin-view.jsx
import { Admin, Resource, ListGuesser, EditGuesser, ShowGuesser } from 'react-admin';
import dataProvider from '../../admin/customDataProvider';
import { 
  FaUsers, 
  FaTools, 
  FaChalkboard, 
  FaUserTie,
  FaCog,
  FaTachometerAlt
} from 'react-icons/fa';

// Custom Dashboard Component
const Dashboard = () => (
  <div className="p-6">
    <div className="flex items-center mb-6">
      <FaTachometerAlt className="h-8 w-8 text-primary-600 mr-3" />
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <FaUsers className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">1,234</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <FaTools className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Alat</p>
            <p className="text-2xl font-bold text-gray-900">567</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 mr-4">
            <FaChalkboard className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Kelas</p>
            <p className="text-2xl font-bold text-gray-900">24</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <FaUserTie className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Guru</p>
            <p className="text-2xl font-bold text-gray-900">45</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
          <FaUsers className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-900">Manage Users</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
          <FaTools className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-900">Manage Alat</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
          <FaChalkboard className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="text-sm font-medium text-yellow-900">Manage Kelas</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
          <FaUserTie className="h-5 w-5 text-purple-600 mr-2" />
          <span className="text-sm font-medium text-purple-900">Manage Guru</span>
        </button>
      </div>
    </div>
  </div>
);

// Custom List Component with better styling
const CustomList = (props) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">{props.resource.name}</h3>
    </div>
    <div className="p-6">
      <ListGuesser {...props} />
    </div>
  </div>
);

export default function AdminView() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Admin 
        dataProvider={dataProvider} 
        dashboard={Dashboard}
        layout={{
          className: "min-h-screen bg-gray-50"
        }}
      >
        <Resource 
          name="users" 
          list={CustomList} 
          edit={EditGuesser} 
          show={ShowGuesser}
          options={{ label: 'Users' }}
          icon={<FaUsers />}
        />
        <Resource 
          name="alat" 
          list={CustomList} 
          edit={EditGuesser} 
          show={ShowGuesser}
          options={{ label: 'Alat' }}
          icon={<FaTools />}
        />
        <Resource 
          name="classes" 
          list={CustomList} 
          edit={EditGuesser} 
          show={ShowGuesser}
          options={{ label: 'Kelas' }}
          icon={<FaChalkboard />}
        />
        <Resource 
          name="teachers" 
          list={CustomList} 
          edit={EditGuesser} 
          show={ShowGuesser}
          options={{ label: 'Guru' }}
          icon={<FaUserTie />}
        />
      </Admin>
    </div>
  );
}