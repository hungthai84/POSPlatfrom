/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_RETURNS,
  INITIAL_ADS,
  INITIAL_COMBOS,
  INITIAL_SUPPLIERS,
  INITIAL_LIVESTREAMS,
  INITIAL_INVOICES,
  INITIAL_CASHFLOW,
  INITIAL_DEBTS,
  INITIAL_TRANSACTIONS,
  INITIAL_CALLS,
  DEFAULT_CONFIG,
  getStoredData,
  setStoredData,
} from "./data";
import {
  Product,
  Order,
  Customer,
  ShopConfig,
  ReturnRequest,
  AdCampaign,
  Combo,
  Supplier,
  LivestreamSession,
  Invoice,
  CashFlow as CashFlowType,
  Debt,
  Transaction,
  CallAppointment,
} from "./types";

// Firebase Integrations
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  writeBatch,
  getDocFromServer,
} from "firebase/firestore";
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  cleanObject,
} from "./firebase";
import { useToast } from "./components/Toast";

// Page components imports
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import POSSales from "./components/POSSales";
import POSReturn from "./components/POSReturn";
import Orders from "./components/Orders";
import Returns from "./components/Returns";
import Ads from "./components/Ads";
import Products from "./components/Products";
import Customers from "./components/Customers";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import WebsiteBuilder from "./components/WebsiteBuilder";
import Reconciliation from "./components/Reconciliation";
import Promotions from "./components/Promotions";
import Combos from "./components/Combos";
import Suppliers from "./components/Suppliers";
import Livestream from "./components/Livestream";
import Invoices from "./components/Invoices";
import CashFlow from "./components/CashFlow";
import DebtManagement from "./components/DebtManagement";
import Transactions from "./components/Transactions";
import Appointments from "./components/Appointments";
import ArchitectureDashboard from "./components/ArchitectureDashboard";

export default function App() {
  const toast = useToast();
  // Navigation & UI Layout State
  const [currentTab, setCurrentTab] = useState<string>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>("");

  // Core Synced Database state
  const [config, setConfig] = useState<ShopConfig>(() =>
    getStoredData<ShopConfig>("lark_pos_config", DEFAULT_CONFIG),
  );

  const [products, setProducts] = useState<Product[]>(() =>
    getStoredData<Product[]>("lark_pos_products", INITIAL_PRODUCTS),
  );

  const [customers, setCustomers] = useState<Customer[]>(() =>
    getStoredData<Customer[]>("lark_pos_customers", INITIAL_CUSTOMERS),
  );

  const [orders, setOrders] = useState<Order[]>(() =>
    getStoredData<Order[]>("lark_pos_orders", INITIAL_ORDERS),
  );

  const [returns, setReturns] = useState<ReturnRequest[]>(() =>
    getStoredData<ReturnRequest[]>("lark_pos_returns", INITIAL_RETURNS),
  );

  const [adsData, setAdsData] = useState<AdCampaign[]>(() =>
    getStoredData<AdCampaign[]>("lark_pos_ads", INITIAL_ADS),
  );

  const [combos, setCombos] = useState<Combo[]>(() =>
    getStoredData<Combo[]>("lark_pos_combos", INITIAL_COMBOS),
  );

  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    getStoredData<Supplier[]>("lark_pos_suppliers", INITIAL_SUPPLIERS),
  );

  const [livestreams, setLivestreams] = useState<LivestreamSession[]>(() =>
    getStoredData<LivestreamSession[]>(
      "lark_pos_livestreams",
      INITIAL_LIVESTREAMS,
    ),
  );

  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    getStoredData<Invoice[]>("lark_pos_invoices", INITIAL_INVOICES),
  );

  const [cashflows, setCashflows] = useState<CashFlowType[]>(() =>
    getStoredData<CashFlowType[]>("lark_pos_cashflow", INITIAL_CASHFLOW),
  );

  const [debts, setDebts] = useState<Debt[]>(() =>
    getStoredData<Debt[]>("lark_pos_debts", INITIAL_DEBTS),
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getStoredData<Transaction[]>("lark_pos_transactions", INITIAL_TRANSACTIONS),
  );

  const [appointments, setAppointments] = useState<CallAppointment[]>(() =>
    getStoredData<CallAppointment[]>("lark_pos_appointments", INITIAL_CALLS),
  );

  // Firebase Authentication & Sync Tracking State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Sync state with cloud when authenticated
  useEffect(() => {
    if (!user) return;

    // Test connection initially as requested by validation constraint
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    // 1. Config Sync Listener
    const unsubConfig = onSnapshot(
      doc(db, "config", "shop"),
      (snap) => {
        if (!snap.exists()) {
          try {
            setDoc(doc(db, "config", "shop"), cleanObject(DEFAULT_CONFIG));
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, "config/shop");
          }
        } else {
          setConfig(snap.data() as ShopConfig);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "config/shop");
      },
    );

    // 2. Products Sync Listener
    const unsubProducts = onSnapshot(
      collection(db, "products"),
      (snap) => {
        if (snap.empty) {
          INITIAL_PRODUCTS.forEach(async (p) => {
            try {
              await setDoc(doc(db, "products", p.id), cleanObject(p));
            } catch (err) {
              handleFirestoreError(
                err,
                OperationType.WRITE,
                `products/${p.id}`,
              );
            }
          });
        } else {
          const list = snap.docs.map((d) => d.data() as Product);
          setProducts(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "products");
      },
    );

    // 3. Customers Sync Listener
    const unsubCustomers = onSnapshot(
      collection(db, "customers"),
      (snap) => {
        if (snap.empty) {
          INITIAL_CUSTOMERS.forEach(async (c) => {
            try {
              await setDoc(doc(db, "customers", c.id), cleanObject(c));
            } catch (err) {
              handleFirestoreError(
                err,
                OperationType.WRITE,
                `customers/${c.id}`,
              );
            }
          });
        } else {
          const list = snap.docs.map((d) => d.data() as Customer);
          setCustomers(list);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "customers");
      },
    );

    // 4. Orders Sync Listener
    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      (snap) => {
        if (snap.empty) {
          INITIAL_ORDERS.forEach(async (o) => {
            try {
              await setDoc(doc(db, "orders", o.id), cleanObject(o));
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `orders/${o.id}`);
            }
          });
        } else {
          const list = snap.docs.map((d) => d.data() as Order);
          const sorted = list.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setOrders(sorted);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "orders");
      },
    );

    return () => {
      unsubConfig();
      unsubProducts();
      unsubCustomers();
      unsubOrders();
    };
  }, [user]);

  // Google Auth Sign-In / Logout actions
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign In failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setConfig(getStoredData<ShopConfig>("lark_pos_config", DEFAULT_CONFIG));
      setProducts(
        getStoredData<Product[]>("lark_pos_products", INITIAL_PRODUCTS),
      );
      setCustomers(
        getStoredData<Customer[]>("lark_pos_customers", INITIAL_CUSTOMERS),
      );
      setOrders(getStoredData<Order[]>("lark_pos_orders", INITIAL_ORDERS));
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Sync state to LocalStorage upon changes (Offline cache fallback)
  useEffect(() => {
    setStoredData("lark_pos_config", config);
  }, [config]);

  useEffect(() => {
    setStoredData("lark_pos_products", products);
  }, [products]);

  useEffect(() => {
    setStoredData("lark_pos_customers", customers);
  }, [customers]);

  useEffect(() => {
    setStoredData("lark_pos_orders", orders);
  }, [orders]);

  useEffect(() => {
    setStoredData("lark_pos_returns", returns);
  }, [returns]);

  useEffect(() => {
    setStoredData("lark_pos_ads", adsData);
  }, [adsData]);

  useEffect(() => {
    setStoredData("lark_pos_combos", combos);
  }, [combos]);

  useEffect(() => {
    setStoredData("lark_pos_suppliers", suppliers);
  }, [suppliers]);

  useEffect(() => {
    setStoredData("lark_pos_livestreams", livestreams);
  }, [livestreams]);

  useEffect(() => {
    setStoredData("lark_pos_invoices", invoices);
  }, [invoices]);

  useEffect(() => {
    setStoredData("lark_pos_cashflow", cashflows);
  }, [cashflows]);

  useEffect(() => {
    setStoredData("lark_pos_debts", debts);
  }, [debts]);

  useEffect(() => {
    setStoredData("lark_pos_transactions", transactions);
  }, [transactions]);

  useEffect(() => {
    setStoredData("lark_pos_appointments", appointments);
  }, [appointments]);

  // Synchronized state mutations
  // 1. Adding a new Order (Atomic batch submission with stocks reduction and loyalty scoring)
  const handleAddOrder = async (newOrder: Order) => {
    if (user) {
      const batch = writeBatch(db);

      // Save order doc
      const orderRef = doc(db, "orders", newOrder.id);
      batch.set(orderRef, cleanObject(newOrder));

      // Adjust inventory indices
      products.forEach((p) => {
        const containsOrderItem = newOrder.items.some(
          (it) => it.productId === p.id,
        );
        if (!containsOrderItem) return;

        const updatedVariants = p.variants.map((v) => {
          const matchingCheckoutItem = newOrder.items.find(
            (it) => it.variantId === v.id,
          );
          if (!matchingCheckoutItem) return v;

          const nextAvailable = Math.max(
            0,
            v.available - matchingCheckoutItem.quantity,
          );
          const nextStock = Math.max(0, v.stock);
          const nextShipping = v.shipping + matchingCheckoutItem.quantity;
          return {
            ...v,
            available: nextAvailable,
            stock: nextStock,
            shipping: nextShipping,
          };
        });

        const totalImport = updatedVariants.reduce((s, v) => s + v.stock, 0);
        const totalAvailable = updatedVariants.reduce(
          (s, v) => s + v.available,
          0,
        );
        const totalShipping = updatedVariants.reduce(
          (s, v) => s + v.shipping,
          0,
        );

        const updatedProduct = {
          ...p,
          variants: updatedVariants,
          totalImport,
          totalAvailable,
          totalShipping,
        };

        batch.set(doc(db, "products", p.id), cleanObject(updatedProduct));
      });

      // Loyalty scoring spend records for customer
      if (newOrder.customer) {
        const matchedCust = customers.find(
          (c) => c.id === newOrder.customer?.id,
        );
        if (matchedCust) {
          const updatedCust = {
            ...matchedCust,
            totalSpent: matchedCust.totalSpent + newOrder.finalAmount,
            orderCount: matchedCust.orderCount + 1,
          };
          batch.set(
            doc(db, "customers", matchedCust.id),
            cleanObject(updatedCust),
          );
        }
      }

      try {
        await batch.commit();
        toast.success(`Đã ghi nhận đơn hàng #${newOrder.id} thành công!`);
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          `orders/batch/${newOrder.id}`,
        );
        toast.error("Ghi nhận đơn hàng thất bại!");
      }
    } else {
      // Local fallback loop
      setOrders((prevOrders) => [newOrder, ...prevOrders]);

      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          const containsOrderItem = newOrder.items.some(
            (it) => it.productId === p.id,
          );
          if (!containsOrderItem) return p;

          const updatedVariants = p.variants.map((v) => {
            const matchingCheckoutItem = newOrder.items.find(
              (it) => it.variantId === v.id,
            );
            if (!matchingCheckoutItem) return v;

            const nextAvailable = Math.max(
              0,
              v.available - matchingCheckoutItem.quantity,
            );
            const nextStock = Math.max(0, v.stock);
            const nextShipping = v.shipping + matchingCheckoutItem.quantity;
            return {
              ...v,
              available: nextAvailable,
              stock: nextStock,
              shipping: nextShipping,
            };
          });

          const totalImport = updatedVariants.reduce((s, v) => s + v.stock, 0);
          const totalAvailable = updatedVariants.reduce(
            (s, v) => s + v.available,
            0,
          );
          const totalShipping = updatedVariants.reduce(
            (s, v) => s + v.shipping,
            0,
          );

          return {
            ...p,
            variants: updatedVariants,
            totalImport,
            totalAvailable,
            totalShipping,
          };
        }),
      );

      if (newOrder.customer) {
        setCustomers((prevCustomers) =>
          prevCustomers.map((c) => {
            if (c.id === newOrder.customer?.id) {
              return {
                ...c,
                totalSpent: c.totalSpent + newOrder.finalAmount,
                orderCount: c.orderCount + 1,
              };
            }
            return c;
          }),
        );
      }
      toast.success(`Đã ghi nhận đơn hàng #${newOrder.id} thành công!`);
    }
  };

  // 2. Adjusting Order Status (Atomic cloud batch with replenishment checking)
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order["status"],
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    if (user) {
      const batch = writeBatch(db);

      // Replenish stock if canceled
      if (status === "canceled" && targetOrder.status !== "canceled") {
        products.forEach((p) => {
          const containsOrderItem = targetOrder.items.some(
            (it) => it.productId === p.id,
          );
          if (!containsOrderItem) return;

          const updatedVariants = p.variants.map((v) => {
            const matchingCheckoutItem = targetOrder.items.find(
              (it) => it.variantId === v.id,
            );
            if (!matchingCheckoutItem) return v;

            const nextAvailable = v.available + matchingCheckoutItem.quantity;
            const nextShipping = Math.max(
              0,
              v.shipping - matchingCheckoutItem.quantity,
            );
            return {
              ...v,
              available: nextAvailable,
              shipping: nextShipping,
            };
          });

          const totalAvailable = updatedVariants.reduce(
            (s, v) => s + v.available,
            0,
          );
          const totalShipping = updatedVariants.reduce(
            (s, v) => s + v.shipping,
            0,
          );

          const updatedProduct = {
            ...p,
            variants: updatedVariants,
            totalAvailable,
            totalShipping,
          };
          batch.set(doc(db, "products", p.id), cleanObject(updatedProduct));
        });

        if (targetOrder.customer) {
          const matchedCust = customers.find(
            (c) => c.id === targetOrder.customer?.id,
          );
          if (matchedCust) {
            const updatedCust = {
              ...matchedCust,
              totalSpent: Math.max(
                0,
                matchedCust.totalSpent - targetOrder.finalAmount,
              ),
              orderCount: Math.max(0, matchedCust.orderCount - 1),
            };
            batch.set(
              doc(db, "customers", matchedCust.id),
              cleanObject(updatedCust),
            );
          }
        }
      }

      // Settle stock and shipping if completed
      if (status === "completed" && targetOrder.status !== "completed") {
        products.forEach((p) => {
          const containsOrderItem = targetOrder.items.some(
            (it) => it.productId === p.id,
          );
          if (!containsOrderItem) return;

          const updatedVariants = p.variants.map((v) => {
            const matchingCheckoutItem = targetOrder.items.find(
              (it) => it.variantId === v.id,
            );
            if (!matchingCheckoutItem) return v;

            const nextStock = Math.max(
              0,
              v.stock - matchingCheckoutItem.quantity,
            );
            const nextShipping = Math.max(
              0,
              v.shipping - matchingCheckoutItem.quantity,
            );
            return {
              ...v,
              stock: nextStock,
              shipping: nextShipping,
            };
          });

          const totalImport = updatedVariants.reduce((s, v) => s + v.stock, 0);
          const totalShipping = updatedVariants.reduce(
            (s, v) => s + v.shipping,
            0,
          );

          const updatedProduct = {
            ...p,
            variants: updatedVariants,
            totalImport,
            totalShipping,
          };
          batch.set(doc(db, "products", p.id), cleanObject(updatedProduct));
        });
      }

      // Commit core update
      batch.update(doc(db, "orders", orderId), { status });

      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      }
    } else {
      // Local fallback loop
      if (status === "canceled" && targetOrder.status !== "canceled") {
        setProducts((prevProducts) =>
          prevProducts.map((p) => {
            const containsOrderItem = targetOrder.items.some(
              (it) => it.productId === p.id,
            );
            if (!containsOrderItem) return p;

            const updatedVariants = p.variants.map((v) => {
              const matchingCheckoutItem = targetOrder.items.find(
                (it) => it.variantId === v.id,
              );
              if (!matchingCheckoutItem) return v;

              const nextAvailable = v.available + matchingCheckoutItem.quantity;
              const nextShipping = Math.max(
                0,
                v.shipping - matchingCheckoutItem.quantity,
              );
              return {
                ...v,
                available: nextAvailable,
                shipping: nextShipping,
              };
            });

            const totalAvailable = updatedVariants.reduce(
              (s, v) => s + v.available,
              0,
            );
            const totalShipping = updatedVariants.reduce(
              (s, v) => s + v.shipping,
              0,
            );

            return {
              ...p,
              variants: updatedVariants,
              totalAvailable,
              totalShipping,
            };
          }),
        );

        if (targetOrder.customer) {
          setCustomers((prevCustomers) =>
            prevCustomers.map((c) => {
              if (c.id === targetOrder.customer?.id) {
                return {
                  ...c,
                  totalSpent: Math.max(
                    0,
                    c.totalSpent - targetOrder.finalAmount,
                  ),
                  orderCount: Math.max(0, c.orderCount - 1),
                };
              }
              return c;
            }),
          );
        }
      }

      if (status === "completed" && targetOrder.status !== "completed") {
        setProducts((prevProducts) =>
          prevProducts.map((p) => {
            const containsOrderItem = targetOrder.items.some(
              (it) => it.productId === p.id,
            );
            if (!containsOrderItem) return p;

            const updatedVariants = p.variants.map((v) => {
              const matchingCheckoutItem = targetOrder.items.find(
                (it) => it.variantId === v.id,
              );
              if (!matchingCheckoutItem) return v;

              const nextStock = Math.max(
                0,
                v.stock - matchingCheckoutItem.quantity,
              );
              const nextShipping = Math.max(
                0,
                v.shipping - matchingCheckoutItem.quantity,
              );
              return {
                ...v,
                stock: nextStock,
                shipping: nextShipping,
              };
            });

            const totalImport = updatedVariants.reduce(
              (s, v) => s + v.stock,
              0,
            );
            const totalShipping = updatedVariants.reduce(
              (s, v) => s + v.shipping,
              0,
            );

            return {
              ...p,
              variants: updatedVariants,
              totalImport,
              totalShipping,
            };
          }),
        );
      }

      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    }
  };

  // 3. Customer actions
  const handleAddCustomer = async (newCustomer: Customer) => {
    if (user) {
      try {
        await setDoc(
          doc(db, "customers", newCustomer.id),
          cleanObject(newCustomer),
        );
        toast.success(`Đã thêm khách hàng "${newCustomer.name}" thành công!`);
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `customers/${newCustomer.id}`,
        );
        toast.error("Thêm khách hàng thất bại!");
      }
    } else {
      setCustomers((prev) => [newCustomer, ...prev]);
      toast.success(`Đã thêm khách hàng "${newCustomer.name}" thành công!`);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, "customers", customerId));
        toast.success("Đã xóa khách hàng thành công!");
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.DELETE,
          `customers/${customerId}`,
        );
        toast.error("Xóa khách hàng thất bại!");
      }
    } else {
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      toast.success("Đã xóa khách hàng thành công!");
    }
  };

  // 4. Products actions
  const handleAddProduct = async (newProduct: Product) => {
    if (user) {
      try {
        await setDoc(
          doc(db, "products", newProduct.id),
          cleanObject(newProduct),
        );
        toast.success(`Đã thêm sản phẩm "${newProduct.name}" thành công!`);
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `products/${newProduct.id}`,
        );
        toast.error("Thêm sản phẩm thất bại!");
      }
    } else {
      setProducts((prev) => [newProduct, ...prev]);
      toast.success(`Đã thêm sản phẩm "${newProduct.name}" thành công!`);
    }
  };

  const handleUpdateProductStatus = async (
    productId: string,
    isActive: boolean,
  ) => {
    if (user) {
      try {
        await updateDoc(doc(db, "products", productId), { isActive });
        toast.success(`Đã cập nhật trạng thái hoạt động thành công!`);
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `products/${productId}`,
        );
        toast.error("Cập nhật trạng thái thất bại!");
      }
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isActive } : p)),
      );
      toast.success(`Đã cập nhật trạng thái hoạt động thành công!`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, "products", productId));
        toast.success("Đã xóa sản phẩm thành công!");
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.DELETE,
          `products/${productId}`,
        );
        toast.error("Xóa sản phẩm thất bại!");
      }
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Đã xóa sản phẩm thành công!");
    }
  };

  // 5. Config actions
  const handleUpdateConfig = async (newConfig: ShopConfig) => {
    if (user) {
      try {
        await setDoc(doc(db, "config", "shop"), cleanObject(newConfig));
        toast.success("Cấu hình hệ thống đã được lưu thành công!");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "config/shop");
        toast.error("Lưu cấu hình hệ thống thất bại!");
      }
    } else {
      setConfig(newConfig);
      toast.success("Cấu hình hệ thống đã được lưu thành công!");
    }
  };

  // 6. DB Resetter (Deletes cloud database records atomically and triggers re-seeding)
  const handleResetDatabase = async () => {
    localStorage.removeItem("lark_pos_products");
    localStorage.removeItem("lark_pos_customers");
    localStorage.removeItem("lark_pos_orders");
    localStorage.removeItem("lark_pos_config");

    if (user) {
      const batch = writeBatch(db);
      products.forEach((p) => batch.delete(doc(db, "products", p.id)));
      customers.forEach((c) => batch.delete(doc(db, "customers", c.id)));
      orders.forEach((o) => batch.delete(doc(db, "orders", o.id)));
      batch.delete(doc(db, "config", "shop"));

      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "reset_database");
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
      setCustomers(INITIAL_CUSTOMERS);
      setOrders(INITIAL_ORDERS);
      setReturns(INITIAL_RETURNS);
      setAdsData(INITIAL_ADS);
      setConfig(DEFAULT_CONFIG);
    }
  };

  const handleUpdateReturnStatus = async (
    requestId: string,
    status: ReturnRequest["status"],
  ) => {
    // Basic local state update for Returns
    setReturns((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r)),
    );
  };

  const handleUpdateAdStatus = (id: string, status: AdCampaign["status"]) => {
    setAdsData((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, status } : ad)),
    );
  };

  const handleAddCombo = (comboData: Omit<Combo, "id">) => {
    const newCombo: Combo = {
      ...comboData,
      id: `CB-${Date.now()}`,
    };
    setCombos((prev) => [newCombo, ...prev]);
  };

  const handleDeleteCombo = (id: string) => {
    setCombos((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleComboStatus = (id: string) => {
    setCombos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
    );
  };

  const handleAddSupplier = (supplierData: Omit<Supplier, "id">) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `SUP-${Date.now()}`,
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleSupplierStatus = (id: string) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    );
  };

  const handleCreateAd = (adData: Omit<AdCampaign, "id">) => {
    const newAd: AdCampaign = {
      ...adData,
      id: `AD-${Date.now()}`,
    };
    setAdsData((prev) => [newAd, ...prev]);
  };

  return (
    <div className="flex h-screen w-screen bg-black p-[5px]">
      <div
        className="flex h-full w-full overflow-hidden rounded-2xl bg-slate-50 font-sans shadow-2xl"
        id="pos-application-root"
      >
        {/* Dynamic Collapsible Sidebar Menu */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            // Auto route search results appropriately depending on tabs
            setGlobalSearch("");
          }}
          config={config}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          orders={orders}
          user={user}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          products={products}
        />

        {/* Main Content Area Layout Container */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
          {/* Dynamic active viewport tabs */}
          <main className="flex-1 overflow-y-auto min-h-0 bg-transparent">
            {currentTab === "overview" && (
              <Overview
                products={products}
                orders={orders}
                customers={customers}
                config={config}
                setCurrentTab={setCurrentTab}
              />
            )}

            {(currentTab === "pos" || currentTab === "sales") && (
              <POSSales
                products={products}
                customers={customers}
                config={config}
                onAddOrder={handleAddOrder}
                onAddCustomer={handleAddCustomer}
              />
            )}

            {currentTab === "sales-return" && (
              <POSReturn products={products} customers={customers} />
            )}

            {(currentTab === "orders" || currentTab === "orders-group") && (
              <Orders
                orders={orders}
                config={config}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {(currentTab === "products" || currentTab === "products-group") && (
              <Products
                products={products}
                config={config}
                onAddProduct={handleAddProduct}
                onUpdateProductStatus={handleUpdateProductStatus}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {currentTab === "customers" && (
              <Customers
                customers={customers}
                orders={orders}
                config={config}
                onAddCustomer={handleAddCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            )}

            {currentTab === "analytics" && (
              <Analytics
                orders={orders}
                products={products}
                customers={customers}
                config={config}
              />
            )}

            {currentTab === "settings" && (
              <Settings
                config={config}
                onUpdateConfig={handleUpdateConfig}
                onResetDatabase={handleResetDatabase}
                products={products}
                customers={customers}
                orders={orders}
              />
            )}

            {currentTab === "reconciliation" && (
              <Reconciliation
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {currentTab === "returns" && (
              <Returns
                returns={returns}
                config={config}
                onUpdateReturnStatus={handleUpdateReturnStatus}
              />
            )}

            {currentTab === "promotions" && <Promotions />}

            {currentTab === "ads" && (
              <Ads
                ads={adsData}
                config={config}
                onUpdateAdStatus={handleUpdateAdStatus}
                onAddAd={handleCreateAd}
              />
            )}

            {currentTab === "combos" && (
              <Combos
                combos={combos}
                products={products}
                config={config}
                onAddCombo={handleAddCombo}
                onDeleteCombo={handleDeleteCombo}
                onToggleStatus={handleToggleComboStatus}
              />
            )}

            {currentTab === "suppliers" && (
              <Suppliers
                suppliers={suppliers}
                config={config}
                onAddSupplier={handleAddSupplier}
                onDeleteSupplier={handleDeleteSupplier}
                onToggleStatus={handleToggleSupplierStatus}
              />
            )}

            {currentTab === "livestream" && (
              <Livestream sessions={livestreams} config={config} />
            )}

            {currentTab === "invoices" && (
              <Invoices invoices={invoices} config={config} />
            )}

            {currentTab === "income-expense" && (
              <CashFlow cashflows={cashflows} config={config} />
            )}

            {currentTab === "debt" && (
              <DebtManagement debts={debts} config={config} />
            )}

            {currentTab === "transactions" && (
              <Transactions transactions={transactions} config={config} />
            )}

            {currentTab === "call-appointments" && (
              <Appointments appointments={appointments} config={config} />
            )}

            {currentTab === "architecture" && (
              <ArchitectureDashboard />
            )}

            {/* Coming Soon Placeholders for remaining tabs */}
            {["not_implemented_yet"].includes(currentTab) && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">⏳</span>
                </div>
                <h2 className="text-[20px] font-bold text-slate-800">
                  Tính năng đang phát triển
                </h2>
                <p className="text-[16px]">
                  Mục <b>{currentTab}</b> sẽ sớm được cập nhật trong phiên bản
                  tiếp theo.
                </p>
                <button
                  onClick={() => setCurrentTab("overview")}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition"
                >
                  Quay lại Tổng quan
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
