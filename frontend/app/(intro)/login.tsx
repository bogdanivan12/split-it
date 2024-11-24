import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Easing,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { signUpStyles as styles } from "@/constants/SharedStyles";
import { CenteredLogoLoadingComponent } from "@/components/LogoLoadingComponent";
import { useIsFocused } from "@react-navigation/native";
import InputWithMessage from "@/components/InputWithMessage";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Theme";
import { Message } from "@/components/Message";
import { useLogin } from "@/utils/hooks/useLogin";
import {
  EMPTY_VALIDATE_LOGIN_RETURN,
  ValidateLoginReturn,
} from "@/utils/validators/login";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

type FormInputProps = {
  username: string;
  password: string;
};

const EMPTY_VALIDATION_FORM = {
  username: "",
  password: "",
};

export default function Login() {
  const { setToken, refreshUser } = useAuth();

  const [logoOpacity] = useState(new Animated.Value(1));

  const [logoScale] = useState(new Animated.Value(1));

  const [marginBot] = useState(new Animated.Value(100));

  const { call: login, loading } = useLogin();

  const isFocused = useIsFocused();

  const [message, setMessage] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  const [keyboardActive, setKeyboardActive] = useState(false);

  const [formValidationErrors, setFormValidationErrors] =
    useState<ValidateLoginReturn>(EMPTY_VALIDATE_LOGIN_RETURN);

  const [formInput, setFormInput] = useState<FormInputProps>(
    EMPTY_VALIDATION_FORM
  );

  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setKeyboardActive(true);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setKeyboardActive(false);
    }, 100);
  };

  const openKeyboardMarginAnim = Animated.timing(marginBot, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  const closeKeyboardMarginAnim = Animated.timing(marginBot, {
    toValue: -50,
    duration: 200,
    useNativeDriver: true,
  });

  const flipAnim = Animated.loop(
    Animated.sequence([
      Animated.delay(10000),
      Animated.timing(logoScale, {
        toValue: -1,
        duration: 600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ])
  );

  useEffect(() => {
    flipAnim.start();
  }, []);

  useEffect(() => {
    setMessage(null);
    setFormInput(EMPTY_VALIDATION_FORM);
    setFormValidationErrors(EMPTY_VALIDATE_LOGIN_RETURN);
  }, [isFocused]);

  useEffect(() => {
    setFormValidationErrors(EMPTY_VALIDATE_LOGIN_RETURN);
  }, [formInput]);

  useEffect(() => {
    if (keyboardActive) {
      openKeyboardMarginAnim.start();
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      return;
    }
    closeKeyboardMarginAnim.start();
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [keyboardActive]);

  const submit = async () => {
    setKeyboardActive(false);
    try {
      const res = await login({
        ...formInput,
      });
      if (!res.validationErrors) {
        setMessage({ text: "Success", error: false });
        console.log(res.token);
        setToken(res.token);
        await refreshUser();
        router.replace("/(account)");
      } else if (res.validationErrors) {
        setFormValidationErrors(res.validationErrors);
      }
    } catch (error: any) {
      setMessage({ error: true, text: error.message });
    }
  };

  const ErrorIcon = (
    <MaterialIcons size={20} color={Colors.theme1.textReject} name="error" />
  );

  const SuccessIcon = (
    <Feather name="check-circle" color={Colors.theme1.textAccept} size={20} />
  );

  if (loading) {
    return <CenteredLogoLoadingComponent />;
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (Keyboard.isVisible()) {
          Keyboard.dismiss();
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
          <Animated.Image
            source={require("@/assets/images/Logo1.png")}
            style={[styles.logo, { transform: [{ scaleX: logoScale }] }]}
          />
        </Animated.View>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.boxWrapper,
              { transform: [{ translateY: marginBot }] },
            ]}
          >
            <View style={styles.registerBox}>
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.headerText}>Let's get into it</Text>

                <View onStartShouldSetResponder={() => true}>
                  <InputWithMessage
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    id="username"
                    placeholder="Username"
                    value={formInput.username}
                    errorMessages={formValidationErrors.username.map(
                      (error) => ({
                        text: error,
                        icon: ErrorIcon,
                      })
                    )}
                    onChangeText={(username) =>
                      setFormInput((prev) => ({ ...prev, username }))
                    }
                  />
                  <InputWithMessage
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    id="password"
                    placeholder="Password"
                    value={formInput.password}
                    password
                    errorMessages={formValidationErrors.password.map(
                      (error) => ({
                        text: error,
                        icon: ErrorIcon,
                      })
                    )}
                    onChangeText={(password) =>
                      setFormInput((prev) => ({ ...prev, password }))
                    }
                  />
                  <TouchableOpacity onPress={submit} style={styles.button}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
            {message && (
              <Message
                containerStyle={{ alignSelf: "center" }}
                style={{ textAlign: "center" }}
                text={message.text}
                color={
                  message.error
                    ? Colors.theme1.textReject
                    : Colors.theme1.textAccept
                }
                icon={message.error ? ErrorIcon : SuccessIcon}
              />
            )}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
