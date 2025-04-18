import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { CartComponent } from './cart/cart.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ProductDetailComponent } from './product-detail/product-detail.component'; // New component
import { OrderComponent } from './order/order.component'; // New component

export const customerRoutes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'cart', component: CartComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'products/:id', component: ProductDetailComponent }, // New route
  { path: 'orders', component: OrderComponent }
];