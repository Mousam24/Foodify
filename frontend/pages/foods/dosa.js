import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import FoodItem from "../../components/FoodItem";
import FoodItemContainer from "../../components/FoodItemContainer";
import FoodLinks from "../../components/FoodLinks";
import { fetchFoods } from "../../redux/slices/foodSlice";

const Dosa = () => {
  const dispatch = useDispatch();

  // defensive selector: default to empty array if data is missing
  const {
    food: { data = [], loading = false, error = null },
  } = useSelector((state) => state);

  // memoize filtered items
  const dosaItems = useMemo(() => {
    return Array.isArray(data) ? data.filter((item) => item.category === "Dosa") : [];
  }, [data]);

  useEffect(() => {
    // dispatch is safe to include in deps
    dispatch(fetchFoods());
  }, [dispatch]);

  return (
    <div className="max-w-6xl mx-auto min-h-[83vh] p-3">
      <FoodLinks />

      {loading ? (
        <p className="text-center text-green-100">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-400">Failed to load items</p>
      ) : dosaItems.length === 0 ? (
        <p className="text-center text-green-100">No dosa items found.</p>
      ) : (
        <FoodItemContainer>
          {dosaItems.map((item) => (
            <FoodItem key={item._id} item={item} />
          ))}
        </FoodItemContainer>
      )}
    </div>
  );
};

export default Dosa;
