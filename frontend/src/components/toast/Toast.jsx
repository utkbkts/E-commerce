import toast from "react-hot-toast";

const Toast = ({ promiseFunction, title, error }) => {
  toast.promise(promiseFunction, {
    loading: "Transaction in progress...",
    success: <b>{title || "Success"}</b>,
    error: <b>{error || "Failed"}</b>,
  });
};

export default Toast;
