ChainTrace 前端架构设计
文档信息
- 版本: v1.0
- 创建时间: 2026-03-12
- 维护团队: ChainTrace 前端团队
- 文档状态: 已完成

---
1. 架构概述
1.1 设计目标
- 用户体验: 流畅的交互，快速的响应
- 性能优化: 首屏加载<2s，P99 响应<500ms
- 可维护性: 代码清晰，组件复用，易于扩展
- 可访问性: 支持键盘导航，屏幕阅读器
- SEO 友好: 支持 SSR/SSG(部分页面)
1.2 技术栈
- 框架: React 18 + TypeScript 5.0
- 构建: Vite 5.0
- UI 库: Ant Design 5.0
- 状态: Zustand + TanStack Query
- 路由: React Router 6
- 样式: CSS Modules + CSS Variables
1.3 架构分层
┌─────────────────────────────────────────┐
│           展示层 (Presentation)          │
│      Page 组件 │ Layout 组件 │ 路由配置   │
├─────────────────────────────────────────┤
│           组件层 (Component)            │
│      业务组件 │ 通用组件 │ UI 组件       │
├─────────────────────────────────────────┤
│           服务层 (Service)              │
│      API 服务 │ 工具函数 │ 常量配置      │
├─────────────────────────────────────────┤
│           状态层 (State)                │
│      本地状态 │ 服务端状态 │ 全局状态    │
└─────────────────────────────────────────┘


---
2. 项目结构
2.1 目录结构
src/
├── assets/           # 静态资源
│   ├── images/       # 图片
│   ├── fonts/        # 字体
│   └── icons/        # 图标
├── components/       # 通用组件
│   ├── common/       # 通用组件
│   ├── business/     # 业务组件
│   └── layouts/      # 布局组件
├── pages/            # 页面组件
│   ├── home/         # 首页
│   ├── address/      # 地址查询
│   ├── transaction/  # 交易追踪
│   ├── analysis/     # 分析页面
│   └── user/         # 用户中心
├── services/         # API 服务
│   ├── api/          # API 调用
│   ├── address.ts    # 地址服务
│   ├── transaction.ts # 交易服务
│   └── user.ts       # 用户服务
├── stores/           # 状态管理
│   ├── user.ts       # 用户状态
│   ├── app.ts        # 应用状态
│   └── settings.ts   # 设置状态
├── hooks/            # 自定义 Hooks
│   ├── useAddress.ts
│   ├── useTransaction.ts
│   └── useUser.ts
├── utils/            # 工具函数
│   ├── format.ts     # 格式化
│   ├── validate.ts   # 验证
│   └── storage.ts    # 存储
├── types/            # TypeScript 类型
│   ├── address.ts
│   ├── transaction.ts
│   └── user.ts
├── constants/        # 常量配置
│   ├── routes.ts     # 路由常量
│   ├── api.ts        # API 常量
│   └── config.ts     # 应用配置
├── styles/           # 全局样式
│   ├── variables.css # CSS 变量
│   ├── global.css    # 全局样式
│   └── reset.css     # 重置样式
├── router/           # 路由配置
│   ├── index.tsx     # 路由入口
│   └── routes.tsx    # 路由定义
└── App.tsx           # 应用入口

2.2 文件命名规范
- 组件文件: PascalCase (UserList.tsx)
- 工具文件: camelCase (formatDate.ts)
- 样式文件: 与组件同名 (UserList.module.css)
- 类型文件: 与对应文件同名 (user.ts)

---
3. 组件设计
3.1 组件分类
UI 组件 (Ant Design)
- Button, Input, Table, Form 等基础组件
- 通过 Theme 定制品牌色
通用组件
- Layout: Header, Sidebar, Footer
- DataDisplay: DataCard, StatCard, TrendChart
- Feedback: Loading, Empty, Error
- Navigation: Breadcrumb, Pagination, Tab
业务组件
- Address: AddressCard, AddressForm, AddressTable
- Transaction: TransactionCard, TransactionFlow
- Analysis: RiskScore, RiskFactors, Report
- User: UserProfile, UserSettings, Membership
3.2 组件设计原则
单一职责
// ✅ 好：单一职责
const AddressCard = ({ address, riskScore }) => { ... }

// ❌ 坏：多职责
const AddressCard = ({ address, riskScore, user, settings }) => { ... }

组合优于继承
// ✅ 好：组合
const Card = ({ children, title }) => (
  <div className="card">
    <h3>{title}</h3>
    {children}
  </div>
)

// ❌ 坏：继承
class AddressCard extends Card { ... }

Props 接口化
interface AddressCardProps {
  address: string;
  riskScore: number;
  onClick?: (address: string) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ 
  address, 
  riskScore, 
  onClick 
}) => { ... }

3.3 组件通信
父传子 (Props)
// 父组件
<Child data={data} onUpdate={handleUpdate} />

// 子组件
const Child: React.FC<{ data: Data; onUpdate: (data: Data) => void }> = ({ 
  data, 
  onUpdate 
}) => { ... }

子传父 (Callback)
// 子组件触发父组件处理
const Child = ({ onEvent }) => {
  const handleClick = () => {
    onEvent({ type: 'click', data: {} });
  };
};

状态提升
// 父组件管理状态
const Parent = () => {
  const [state, setState] = useState('');
  
  return (
    <>
      <Child1 state={state} onChange={setState} />
      <Child2 state={state} onChange={setState} />
    </>
  );
};

Context API
// 创建 Context
const ThemeContext = createContext<Theme>('light');

// 提供 Context
<ThemeContext.Provider value={theme}>
  {children}
</ThemeContext.Provider>

// 使用 Context
const theme = useContext(ThemeContext);


---
4. 状态管理
4.1 状态分类
本地状态 (useState)
使用场景: 组件内部状态，不共享
const [loading, setLoading] = useState(false);
const [searchText, setSearchText] = useState('');

全局状态 (Zustand)
使用场景: 跨组件共享状态
// stores/user.ts
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));

服务端状态 (TanStack Query)
使用场景: API 数据获取、缓存
// hooks/useAddress.ts
import { useQuery } from '@tanstack/react-query';

export const useAddress = (address: string) => {
  return useQuery({
    queryKey: ['address', address],
    queryFn: () => api.getAddress(address),
    staleTime: 5 * 60 * 1000, // 5 分钟
  });
};

4.2 Zustand 使用
基础 Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark';
  language: string;
  toggleTheme: () => void;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'zh-CN',
      toggleTheme: () => 
        set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'app-storage' }
  )
);

多个 Store
// stores/index.ts
export { useUserStore } from './user';
export { useAppStore } from './app';
export { useSettingsStore } from './settings';

// 使用
const user = useUserStore((state) => state.user);
const theme = useAppStore((state) => state.theme);

4.3 TanStack Query 使用
查询数据
const { 
  data, 
  isLoading, 
  error, 
  refetch 
} = useQuery({
  queryKey: ['addresses', filter],
  queryFn: () => api.getAddresses(filter),
  staleTime: 10 * 60 * 1000,
  retry: 3,
});

突变数据
const mutate = useMutation({
  mutationFn: api.createAddress,
  onSuccess: () => {
    queryClient.invalidateQueries(['addresses']);
  },
});

乐观更新
const mutate = useMutation({
  mutationFn: api.updateAddress,
  optimisticUpdate: (queryCache, update) => {
    const query = queryCache.getQueryData(['address', id]);
    queryCache.setQueryData(['address', id], { ...query, ...update });
  },
  rollbackOnError: true,
});


---
5. 路由设计
5.1 路由配置
// router/routes.tsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'address',
        children: [
          {
            index: true,
            element: <AddressList />,
          },
          {
            path: ':id',
            element: <AddressDetail />,
          },
        ],
      },
      {
        path: 'transaction',
        element: <TransactionPage />,
      },
      {
        path: 'analysis',
        element: <AnalysisPage />,
      },
      {
        path: 'user',
        element: <UserLayout />,
        children: [
          {
            index: true,
            element: <UserProfile />,
          },
          {
            path: 'settings',
            element: <UserSettings />,
          },
        ],
      },
    ],
  },
]);

5.2 路由守卫
// router/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/user';

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const token = useUserStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

5.3 路由传参
URL 参数
// 定义路由
{ path: 'address/:id', element: <AddressDetail /> }

// 获取参数
import { useParams } from 'react-router-dom';

const AddressDetail = () => {
  const { id } = useParams();
};

Search 参数
// 跳转带参数
navigate('/address?tab=transactions&sort=desc');

// 获取参数
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();
const tab = searchParams.get('tab');

State 传参
// 跳转带 state
navigate('/address/123', { state: { from: 'search' } });

// 获取 state
import { useLocation } from 'react-router-dom';

const location = useLocation();
const from = location.state?.from;


---
6. API 集成
6.1 API 客户端
// services/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;

6.2 API 服务
// services/api/address.ts
import apiClient from './client';

export const addressApi = {
  // 获取地址列表
  getAddresses: (params: AddressFilter) => 
    apiClient.get('/api/v1/addresses', { params }),
  
  // 获取地址详情
  getAddress: (id: string) => 
    apiClient.get(`/api/v1/addresses/${id}`),
  
  // 创建地址
  createAddress: (data: CreateAddressData) => 
    apiClient.post('/api/v1/addresses', data),
  
  // 更新地址
  updateAddress: (id: string, data: UpdateAddressData) => 
    apiClient.put(`/api/v1/addresses/${id}`, data),
  
  // 删除地址
  deleteAddress: (id: string) => 
    apiClient.delete(`/api/v1/addresses/${id}`),
};

6.3 错误处理
// services/api/error.ts
export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

// 统一错误处理
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return new ApiError(
      error.response.status,
      error.response.data?.message || '请求失败',
      error.response.data
    );
  }
  
  return new ApiError(0, '网络错误，请检查网络连接');
};


---
7. 样式设计
7.1 CSS 变量
/* styles/variables.css */
:root {
  /* 品牌色 */
  --color-primary: #1890ff;
  --color-primary-hover: #40a9ff;
  --color-primary-active: #096dd9;
  
  /* 语义色 */
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;
  --color-info: #1890ff;
  
  /* 中性色 */
  --color-text-primary: #000000e6;
  --color-text-secondary: #000000a6;
  --color-text-disabled: #00000026;
  --color-border: #d9d9d9;
  --color-background: #ffffff;
  
  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 圆角 */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* 暗黑模式 */
[data-theme='dark'] {
  --color-background: #000000;
  --color-text-primary: #ffffff;
  --color-text-secondary: #ffffffa6;
}

7.2 CSS Modules
/* components/AddressCard/AddressCard.module.css */
.container {
  padding: var(--spacing-md);
  background: var(--color-background);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.riskScore {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 14px;
}

.riskScore.high {
  background: var(--color-error);
  color: #fff;
}

.riskScore.medium {
  background: var(--color-warning);
  color: #fff;
}

.riskScore.low {
  background: var(--color-success);
  color: #fff;
}

// components/AddressCard/AddressCard.tsx
import styles from './AddressCard.module.css';

const AddressCard = ({ address, riskScore }) => (
  <div className={styles.container}>
    <h3 className={styles.title}>{address}</h3>
    <span className={`${styles.riskScore} <equation>{styles[`riskScore</equation>{riskScore}`]}`}>
      {riskScore}
    </span>
  </div>
);

7.3 响应式设计
/* styles/global.css */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* 移动端 */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-sm);
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面 */
@media (min-width: 1025px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}


---
8. 性能优化
8.1 代码分割
// router/routes.tsx
import { lazy } from 'react';
import { Route } from 'react-router-dom';

const HomePage = lazy(() => import('@/pages/home'));
const AddressDetail = lazy(() => import('@/pages/address/detail'));

<Route 
  path="address/:id" 
  element={
    <React.Suspense fallback={<Loading />}>
      <AddressDetail />
    </React.Suspense>
  } 
/>

8.2 组件优化
// 使用 React.memo
const AddressCard = React.memo(({ address, riskScore }) => {
  // ...
});

// 使用 useMemo
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);

// 使用 useCallback
const handleClick = useCallback((id: string) => {
  console.log('Clicked:', id);
}, []);

8.3 图片优化
// 使用懒加载
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage 
  alt="address" 
  src={imageUrl} 
  placeholderSrc={placeholderUrl}
/>

// 使用 WebP 格式
<img src={imageWebP} srcSet={imageJPG} alt="address" />

8.4 打包优化
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd'],
          charts: ['@antv/g2', 'echarts'],
        },
      },
    },
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: -10,
        },
      },
    },
  },
});


---
9. 附录
9.1 版本历史
- v1.0 (2026-03-12): 初始版本，完成前端架构设计文档
9.2 参考资料
- React 官方文档
- TypeScript 官方文档
- Ant Design 官方文档
- Vite 官方文档
9.3 相关文档
- 技术选型文档
- 后端架构设计
- UI/UX设计