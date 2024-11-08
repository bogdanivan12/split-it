import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function GroupId() {
  const { id } = useLocalSearchParams();
  console.log(id);
  return (
    <Redirect
      href={{
        pathname: "/(bill)",
        params: {
          id: id,
        },
      }}
    />
  );
}