import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, REAL_ESTATE_ABI, TARGET_CHAIN } from "../constants";
import { DEMO_PROPERTIES, DEMO_REVIEWS } from "../data/properties";

const {
  createContract,
  createReadProvider,
  createWalletProvider,
  ensureTargetChain,
  isContractConfigured,
  normalizeChainId,
  parseWeb3Error,
  transactionUrl,
} = require("../services/web3");
const { normalizeProperty, normalizeReview, shortAddress } = require("../services/normalizers");
const {
  DEMO_STORAGE_KEYS,
  LEGACY_STORAGE_KEYS,
  readStoredJson,
  writeStoredJson,
} = require("../services/storage");
const { validatePropertyForm, validateReview } = require("../services/validation");

const RealEstateContext = createContext(null);
const TARGET_CHAIN_ID = normalizeChainId(TARGET_CHAIN.chainId);
const IDLE_TRANSACTION = Object.freeze({
  phase: "idle",
  label: "",
  hash: "",
  explorerUrl: "",
});

const getBrowserStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch (_) {
    return null;
  }
};

export function RealEstateProvider({ children }) {
  const configuredForLive = isContractConfigured(CONTRACT_ADDRESS);
  const isDemo = !configuredForLive;
  const mode = isDemo ? "demo" : "live";

  const [currentAccount, setCurrentAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState("");
  const [walletStatus, setWalletStatus] = useState("detecting");
  const [properties, setProperties] = useState(isDemo ? DEMO_PROPERTIES : []);
  const [reviews, setReviews] = useState(isDemo ? DEMO_REVIEWS : {});
  const [listingPrice, setListingPrice] = useState("0");
  const [loading, setLoading] = useState(true);
  const [transactionState, setTransactionState] = useState(IDLE_TRANSACTION);
  const [notification, setNotification] = useState(null);
  const transactionTimer = useRef(null);
  const walletRecoveryTimer = useRef(null);

  const notify = useCallback((type, message) => {
    if (!message) {
      setNotification(null);
      return;
    }
    setNotification({ id: Date.now(), type, message });
  }, []);

  const dismissNotification = useCallback(() => setNotification(null), []);
  const setError = useCallback(
    (message) => (message ? notify("error", message) : dismissNotification()),
    [dismissNotification, notify]
  );

  const getWalletProvider = useCallback(() => {
    if (typeof window === "undefined") return null;
    return createWalletProvider(window.ethereum);
  }, []);

  const getReadContract = useCallback(() => {
    if (!configuredForLive) return null;
    return createContract({
      address: CONTRACT_ADDRESS,
      abi: REAL_ESTATE_ABI,
      provider: createReadProvider(TARGET_CHAIN),
    });
  }, [configuredForLive]);

  const getWriteContract = useCallback(async () => {
    if (!configuredForLive) return null;
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Install MetaMask or another EVM wallet to transact.");
    }
    await ensureTargetChain(window.ethereum, TARGET_CHAIN);
    const provider = getWalletProvider();
    return createContract({
      address: CONTRACT_ADDRESS,
      abi: REAL_ESTATE_ABI,
      provider,
      write: true,
    });
  }, [configuredForLive, getWalletProvider]);

  const refreshWallet = useCallback(
    async (accountOverride) => {
      if (typeof window === "undefined" || !window.ethereum) {
        setCurrentAccount("");
        setBalance("0");
        setChainId("");
        setWalletStatus("unavailable");
        return { account: "", chainId: "" };
      }

      const provider = getWalletProvider();
      const accounts =
        accountOverride === undefined
          ? await provider.listAccounts()
          : accountOverride
            ? [accountOverride]
            : [];
      const account = accounts[0] || "";
      const network = await provider.getNetwork();
      const nextChainId = normalizeChainId(network.chainId);

      setChainId(nextChainId);
      setCurrentAccount(account);
      setWalletStatus(account ? "connected" : "disconnected");

      if (!account) {
        setBalance("0");
      } else {
        const value = await provider.getBalance(account);
        setBalance(Number(ethers.utils.formatEther(value)).toFixed(4));
      }
      return { account, chainId: nextChainId };
    },
    [getWalletProvider]
  );

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      if (configuredForLive) {
        const contract = getReadContract();
        const [propertyResult, fee] = await Promise.all([
          contract.getAllProperties(),
          contract.getListingPrice(),
        ]);
        setProperties(propertyResult.map(normalizeProperty));
        setListingPrice(ethers.utils.formatEther(fee));
      } else {
        const storage = getBrowserStorage();
        setProperties(
          readStoredJson(
            storage,
            DEMO_STORAGE_KEYS.properties,
            DEMO_PROPERTIES,
            LEGACY_STORAGE_KEYS.properties
          ).map(normalizeProperty)
        );
        setReviews(
          readStoredJson(
            storage,
            DEMO_STORAGE_KEYS.reviews,
            DEMO_REVIEWS,
            LEGACY_STORAGE_KEYS.reviews
          )
        );
        setListingPrice("0");
      }
      return true;
      } catch (error) {
        // Preserve the last successful live result during a transient RPC outage.
        notify("error", parseWeb3Error(error, "Unable to load marketplace data."));
      return false;
    } finally {
      setLoading(false);
    }
  }, [configuredForLive, getReadContract, notify]);

  const switchNetwork = useCallback(async () => {
    if (isDemo) {
      notify("info", "Demo mode uses browser data and does not require Polygon Amoy.");
      return true;
    }
    try {
      if (typeof window === "undefined") return false;
      await ensureTargetChain(window.ethereum, TARGET_CHAIN);
      await refreshWallet();
      notify("success", "Wallet connected to Polygon Amoy.");
      return true;
    } catch (error) {
      notify("error", parseWeb3Error(error, "Unable to switch networks."));
      return false;
    }
  }, [isDemo, notify, refreshWallet]);

  const connectWallet = useCallback(async () => {
    dismissNotification();
    if (typeof window === "undefined" || !window.ethereum) {
      setWalletStatus("unavailable");
      notify("error", "Install MetaMask or another EVM wallet to connect.");
      return "";
    }

    setWalletStatus("connecting");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (configuredForLive) await ensureTargetChain(window.ethereum, TARGET_CHAIN);
      const snapshot = await refreshWallet(accounts[0] || "");
      if (!snapshot.account) throw new Error("No wallet account was selected.");
      notify(
        "success",
        isDemo ? "Wallet connected in demo mode." : "Wallet connected to Polygon Amoy."
      );
      return snapshot.account;
    } catch (error) {
      setWalletStatus("disconnected");
      notify("error", parseWeb3Error(error, "Unable to connect the wallet."));
      return "";
    }
  }, [configuredForLive, dismissNotification, isDemo, notify, refreshWallet]);

  useEffect(() => {
    fetchProperties();
    if (typeof window === "undefined" || !window.ethereum) {
      setWalletStatus("unavailable");
      return undefined;
    }

    refreshWallet().catch((error) =>
      notify("error", parseWeb3Error(error, "Unable to read wallet state."))
    );

    const onAccountsChanged = (accounts) => {
      if (walletRecoveryTimer.current) clearTimeout(walletRecoveryTimer.current);
      refreshWallet(accounts[0] || "")
          .then(() => fetchProperties())
          .catch((error) =>
            notify("error", parseWeb3Error(error, "Unable to update the wallet account."))
          );
    };
    const onChainChanged = () => {
      refreshWallet()
        .then(() => fetchProperties())
        .catch((error) =>
          notify("error", parseWeb3Error(error, "Unable to update the wallet network."))
        );
    };
    const onDisconnect = () => {
      // MetaMask may briefly drop its provider transport as a transaction
      // window closes. An intentional account disconnect is separately
      // reported by accountsChanged with an empty list, so recover first.
      if (walletRecoveryTimer.current) clearTimeout(walletRecoveryTimer.current);
      walletRecoveryTimer.current = setTimeout(() => {
        refreshWallet().catch(() => {
          setWalletStatus("reconnecting");
          notify("info", "Wallet connection interrupted. Reopen MetaMask to reconnect.");
        });
      }, 600);
    };

    window.ethereum.on?.("accountsChanged", onAccountsChanged);
    window.ethereum.on?.("chainChanged", onChainChanged);
    window.ethereum.on?.("disconnect", onDisconnect);
    return () => {
      window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener?.("chainChanged", onChainChanged);
      window.ethereum.removeListener?.("disconnect", onDisconnect);
      if (transactionTimer.current) clearTimeout(transactionTimer.current);
      if (walletRecoveryTimer.current) clearTimeout(walletRecoveryTimer.current);
    };
  }, [fetchProperties, notify, refreshWallet]);

  const requireAccount = useCallback(async () => {
    const account = currentAccount || (await connectWallet());
    if (account && configuredForLive) {
      const switched = await switchNetwork();
      if (!switched) return "";
    }
    return account;
  }, [configuredForLive, connectWallet, currentAccount, switchNetwork]);

  const finishTransactionLater = useCallback(() => {
    if (transactionTimer.current) clearTimeout(transactionTimer.current);
    transactionTimer.current = setTimeout(
      () => setTransactionState(IDLE_TRANSACTION),
      3500
    );
  }, []);

  const runTransaction = useCallback(
    async (label, successMessage, action) => {
      dismissNotification();
      if (transactionTimer.current) clearTimeout(transactionTimer.current);
      setTransactionState({ ...IDLE_TRANSACTION, phase: "preparing", label });
      try {
        const result = await action();
        let receipt = null;
        if (result?.wait) {
          setTransactionState({
            phase: "pending",
            label,
            hash: result.hash || "",
            explorerUrl: transactionUrl(TARGET_CHAIN, result.hash),
          });
          receipt = await result.wait();
          if (receipt?.status === 0) throw new Error("The transaction failed on-chain.");
        }

        const refreshed = await fetchProperties();
        // Re-read the signer after MetaMask closes its confirmation window so
        // the connected wallet stays visible after a successful transaction.
        await refreshWallet().catch(() => null);
        const confirmationMessage = refreshed
          ? successMessage
          : `${successMessage} Refresh the marketplace to load the latest records.`;
        setTransactionState({
          phase: "confirmed",
          label: confirmationMessage,
          hash: result?.hash || receipt?.transactionHash || "",
          explorerUrl: transactionUrl(
            TARGET_CHAIN,
            result?.hash || receipt?.transactionHash
          ),
        });
        notify(refreshed ? "success" : "info", confirmationMessage);
        finishTransactionLater();
        return true;
      } catch (error) {
        const message = parseWeb3Error(error);
        setTransactionState({ ...IDLE_TRANSACTION, phase: "failed", label: message });
        notify("error", message);
        finishTransactionLater();
        return false;
      }
    },
    [dismissNotification, fetchProperties, finishTransactionLater, notify, refreshWallet]
  );

  const createProperty = useCallback(
    async (form) => {
      const validationError = validatePropertyForm(form);
      if (validationError) {
        notify("error", validationError);
        return false;
      }
      const account = await requireAccount();
      if (!account) return false;

      return runTransaction("Creating property…", "Property created successfully.", async () => {
        const contract = await getWriteContract();
        if (contract) {
          const fee = await contract.getListingPrice();
          return contract.listProperty(
            account,
            ethers.utils.parseEther(String(form.price)),
            form.propertyTitle.trim(),
            form.category.trim(),
            form.images.trim(),
            form.propertyAddress.trim(),
            form.description.trim(),
            { value: fee }
          );
        }

        const storage = getBrowserStorage();
        const stored = readStoredJson(
          storage,
          DEMO_STORAGE_KEYS.properties,
          DEMO_PROPERTIES,
          LEGACY_STORAGE_KEYS.properties
        );
        const nextId =
          stored.reduce((highest, item) => Math.max(highest, Number(item.productID) || 0), 0) + 1;
        const next = [
          ...stored,
          normalizeProperty({
            ...form,
            productID: String(nextId),
            owner: account,
            reviewers: [],
            reviews: [],
          }),
        ];
        writeStoredJson(storage, DEMO_STORAGE_KEYS.properties, next);
        setProperties(next);
        return { demo: true };
      });
    },
    [getWriteContract, notify, requireAccount, runTransaction]
  );

  const updateProperty = useCallback(
    async (id, form) => {
      const validationError = validatePropertyForm({ ...form, price: "1" });
      if (validationError) {
        notify("error", validationError);
        return false;
      }
      const account = await requireAccount();
      if (!account) return false;

      return runTransaction("Updating property…", "Property updated successfully.", async () => {
        const contract = await getWriteContract();
        if (contract) {
          return contract.updateProperty(
            account,
            id,
            form.propertyTitle.trim(),
            form.category.trim(),
            form.images.trim(),
            form.propertyAddress.trim(),
            form.description.trim()
          );
        }

        const storage = getBrowserStorage();
        const stored = readStoredJson(
          storage,
          DEMO_STORAGE_KEYS.properties,
          DEMO_PROPERTIES,
          LEGACY_STORAGE_KEYS.properties
        );
        const property = stored.find((item) => String(item.productID) === String(id));
        if (!property) throw new Error("Property does not exist.");
        if (String(property.owner).toLowerCase() !== account.toLowerCase()) {
          throw new Error("You are not the owner.");
        }
        const next = stored.map((item) =>
          String(item.productID) === String(id) ? { ...item, ...form } : item
        );
        writeStoredJson(storage, DEMO_STORAGE_KEYS.properties, next);
        setProperties(next.map(normalizeProperty));
        return { demo: true };
      });
    },
    [getWriteContract, notify, requireAccount, runTransaction]
  );

  const updatePrice = useCallback(
    async (id, price) => {
      if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
        notify("error", "Price must be greater than zero.");
        return false;
      }
      const account = await requireAccount();
      if (!account) return false;

      return runTransaction("Updating price…", "Property price updated.", async () => {
        const contract = await getWriteContract();
        if (contract) {
          return contract.updatePrice(account, id, ethers.utils.parseEther(String(price)));
        }
        const storage = getBrowserStorage();
        const stored = readStoredJson(
          storage,
          DEMO_STORAGE_KEYS.properties,
          DEMO_PROPERTIES,
          LEGACY_STORAGE_KEYS.properties
        );
        const property = stored.find((item) => String(item.productID) === String(id));
        if (!property) throw new Error("Property does not exist.");
        if (String(property.owner).toLowerCase() !== account.toLowerCase()) {
          throw new Error("You are not the owner.");
        }
        const next = stored.map((item) =>
          String(item.productID) === String(id) ? { ...item, price: String(price) } : item
        );
        writeStoredJson(storage, DEMO_STORAGE_KEYS.properties, next);
        setProperties(next.map(normalizeProperty));
        return { demo: true };
      });
    },
    [getWriteContract, notify, requireAccount, runTransaction]
  );

  const buyProperty = useCallback(
    async (property) => {
      const account = await requireAccount();
      if (!account) return false;
      if (String(property.owner).toLowerCase() === account.toLowerCase()) {
        notify("error", "You cannot buy your own property.");
        return false;
      }

      return runTransaction("Purchasing property…", "Property purchased successfully.", async () => {
        const contract = await getWriteContract();
        if (contract) {
          return contract.buyProperty(property.productID, account, {
            value: ethers.utils.parseEther(String(property.price)),
          });
        }
        const storage = getBrowserStorage();
        const stored = readStoredJson(
          storage,
          DEMO_STORAGE_KEYS.properties,
          DEMO_PROPERTIES,
          LEGACY_STORAGE_KEYS.properties
        );
        const existing = stored.find(
          (item) => String(item.productID) === String(property.productID)
        );
        if (!existing) throw new Error("Property does not exist.");
        const next = stored.map((item) =>
          String(item.productID) === String(property.productID)
            ? { ...item, owner: account }
            : item
        );
        writeStoredJson(storage, DEMO_STORAGE_KEYS.properties, next);
        setProperties(next.map(normalizeProperty));
        return { demo: true };
      });
    },
    [getWriteContract, notify, requireAccount, runTransaction]
  );

  const getProperty = useCallback(
    async (id) => {
      if (configuredForLive) {
        try {
          return normalizeProperty(await getReadContract().getProperty(id));
        } catch (error) {
          notify("error", parseWeb3Error(error, "Unable to load the property."));
          return null;
        }
      }
      return properties.find((item) => String(item.productID) === String(id)) || null;
    },
    [configuredForLive, getReadContract, notify, properties]
  );

  const getPropertyReviews = useCallback(
    async (id) => {
      if (!configuredForLive) return (reviews[id] || []).map(normalizeReview);
      try {
        const result = await getReadContract().getProductReviews(id);
        return result.map(normalizeReview);
      } catch (error) {
        notify("error", parseWeb3Error(error, "Unable to load property reviews."));
        return [];
      }
    },
    [configuredForLive, getReadContract, notify, reviews]
  );

  const addReview = useCallback(
    async (id, rating, comment) => {
      const validationError = validateReview(rating, comment);
      if (validationError) {
        notify("error", validationError);
        return false;
      }
      const account = await requireAccount();
      if (!account) return false;

      return runTransaction("Publishing review…", "Review published.", async () => {
        const contract = await getWriteContract();
        if (contract) return contract.addReview(id, Number(rating), comment.trim(), account);

        const storage = getBrowserStorage();
        const stored = readStoredJson(
          storage,
          DEMO_STORAGE_KEYS.reviews,
          DEMO_REVIEWS,
          LEGACY_STORAGE_KEYS.reviews
        );
        const nextReviewId =
          Object.values(stored)
            .flat()
            .reduce(
              (highest, review) => Math.max(highest, Number(review.reviewIndex) || 0),
              -1
            ) + 1;
        const next = {
          ...stored,
          [id]: [
            ...(stored[id] || []),
            {
              reviewer: account,
              productId: String(id),
              rating: Number(rating),
              comment: comment.trim(),
              likes: 0,
              reviewIndex: String(nextReviewId),
            },
          ],
        };
        writeStoredJson(storage, DEMO_STORAGE_KEYS.reviews, next);
        setReviews(next);
        return { demo: true };
      });
    },
    [getWriteContract, notify, requireAccount, runTransaction]
  );

  const likeReview = useCallback(
    async (id, reviewIndex) => {
      const account = await requireAccount();
      if (!account) return false;

      return runTransaction("Liking review…", "Review liked.", async () => {
        const contract = await getWriteContract();
        if (contract) return contract.likeReview(id, reviewIndex, account);

        const storage = getBrowserStorage();
        const liked = readStoredJson(storage, DEMO_STORAGE_KEYS.likes, {});
        const likeKey = `${reviewIndex}:${account.toLowerCase()}`;
        if (liked[likeKey]) throw new Error("Review already liked.");

        const stored = readStoredJson(
          storage,
          DEMO_STORAGE_KEYS.reviews,
          DEMO_REVIEWS,
          LEGACY_STORAGE_KEYS.reviews
        );
        let matched = false;
        const next = {
          ...stored,
          [id]: (stored[id] || []).map((review) => {
            if (String(review.reviewIndex) !== String(reviewIndex)) return review;
            matched = true;
            return { ...review, likes: Number(review.likes) + 1 };
          }),
        };
        if (!matched) throw new Error("Review does not exist.");
        writeStoredJson(storage, DEMO_STORAGE_KEYS.reviews, next);
        writeStoredJson(storage, DEMO_STORAGE_KEYS.likes, { ...liked, [likeKey]: true });
        setReviews(next);
        return { demo: true };
      });
    },
    [getWriteContract, requireAccount, runTransaction]
  );

  const creators = useMemo(() => {
    const grouped = properties.reduce((accumulator, item) => {
      const key = item.owner || "Unknown";
      if (!accumulator[key]) accumulator[key] = { owner: key, total: 0, count: 0 };
      accumulator[key].total += Number(item.price || 0);
      accumulator[key].count += 1;
      return accumulator;
    }, {});
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [properties]);

  const isCorrectChain = isDemo || !chainId || chainId === TARGET_CHAIN_ID;
  const networkStatus =
    walletStatus !== "connected"
      ? walletStatus
      : isCorrectChain
        ? "ready"
        : "wrong-network";
  const transaction = ["preparing", "pending"].includes(transactionState.phase)
    ? transactionState.label
    : "";
  const error = notification?.type === "error" ? notification.message : "";

  const value = {
    currentAccount,
    balance,
    chainId,
    walletStatus,
    networkStatus,
    isCorrectChain,
    properties,
    creators,
    loading,
    listingPrice,
    transaction,
    transactionState,
    notification,
    error,
    isDemo,
    mode,
    dataSource: isDemo ? "browser-demo" : "polygon-amoy",
    modeLabel: isDemo ? "Demo data" : "Polygon Amoy",
    connectWallet,
    switchNetwork,
    refreshWallet,
    fetchProperties,
    createProperty,
    updateProperty,
    updatePrice,
    buyProperty,
    getProperty,
    getPropertyReviews,
    addReview,
    likeReview,
    shortAddress,
    notify,
    dismissNotification,
    setError,
  };

  return <RealEstateContext.Provider value={value}>{children}</RealEstateContext.Provider>;
}

export const useRealEstate = () => {
  const context = useContext(RealEstateContext);
  if (!context) throw new Error("useRealEstate must be used inside RealEstateProvider");
  return context;
};

export { RealEstateContext };
