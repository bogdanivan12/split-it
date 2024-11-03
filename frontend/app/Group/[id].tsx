import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function GroupId() {
  const { id } = useLocalSearchParams();
  console.log(id);
  return (
    <Redirect
      href={{
        pathname: "/(acctabs)",
        params: {
          id: id,
        },
      }}
    />
  );
}