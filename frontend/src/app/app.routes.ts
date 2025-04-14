// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { authRoutes } from './features/auth/auth.routes';
import { customerRoutes } from './features/customer/customer.routes';
import { VendorStoreComponent } from './features/vendor/vendor-store/vendor-store.component';
import { AddProductComponent } from './features/vendor/add-product/add-product.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AdminVendorsComponent } from './features/admin/admin-vendors/admin-vendors.component';
import { AdminProductsComponent } from './features/admin/admin-products/admin-products.component';  
import { ManageOrdersComponent } from './features/admin/manage-orders/manage-orders.component';
import { HomeComponent } from './features/home/home.component';


export const appRoutes: Routes = [

    {
    path: 'home',
    component: HomeComponent // Temporary placeholder until we create a HomeComponent
  }

  ,
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },


  {
    path: '',
    children: [
      ...authRoutes,
      ...customerRoutes,
      {
        path: 'vendor',
        children: [
          { path: 'store', component: VendorStoreComponent },
          { path: 'add-product', component: AddProductComponent }
        ]
      }
    ]
  }

,

  {
    path: 'admin',
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'vendors', component: AdminVendorsComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'manage-orders', component: ManageOrdersComponent}
    ]
  }



  // Add more routes as we create components
];