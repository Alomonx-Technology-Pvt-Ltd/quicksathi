import { useParams, Navigate } from "react-router-dom";
import ServiceDetail from "./ServiceDetail";

const ProductDetail = () => {
  const { id } = useParams();
  if (id) {
    return <Navigate to={`/service/${id}`} replace />;
  }
  return <ServiceDetail />;
};

export default ProductDetail;
