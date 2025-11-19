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
import { useRegister } from "@/utils/hooks/useRegister";
import { CenteredLogoLoadingComponent } from "@/components/LogoLoadingComponent";
import { useIsFocused } from "@react-navigation/native";
import { InputWithMessage } from "@/components/InputWithMessage";
import {
  EMPTY_VALIDATE_REGISTER_RETURN,
  ValidateRegisterReturn,
} from "@/utils/validators/register";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Theme";
import { Message } from "@/components/Message";
import { ErrorIcon, SuccessIcon } from "@/components/Icons";

type FormInputProps = {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
};

const EMPTY_VALIDATION_FORM = {
  username: "vladrosuuu",
  password: "123456",
  confirmPassword: "123456",
  email: "vladd@gmail.com",
};

export default function Register() {
  const [logoOpacity] = useState(new Animated.Value(1));

  const [logoScale] = useState(new Animated.Value(1));

  const [marginBot] = useState(new Animated.Value(100));

  const { call: register, loading } = useRegister();

  const isFocused = useIsFocused();

  const [message, setMessage] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  const [keyboardActive, setKeyboardActive] = useState(false);

  const [formValidationErrors, setFormValidationErrors] =
    useState<ValidateRegisterReturn>(EMPTY_VALIDATE_REGISTER_RETURN);

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
    setFormValidationErrors(EMPTY_VALIDATE_REGISTER_RETURN);
  }, [isFocused]);

  useEffect(() => {
    setFormValidationErrors(EMPTY_VALIDATE_REGISTER_RETURN);
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
      const res = await register({
        ...formInput,
      });
      if (!res.validationErrors) {
        setMessage({ text: "User registered successfully", error: false });
      } else {
        setFormValidationErrors(res.validationErrors);
      }
    } catch (error: any) {
      setMessage({ error: true, text: error.message });
    }
  };

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
                <Text style={styles.headerText}>Get ready to Split-It</Text>

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
                    id="email"
                    placeholder="Email"
                    value={formInput.email}
                    errorMessages={formValidationErrors.email.map((error) => ({
                      text: error,
                      icon: ErrorIcon,
                    }))}
                    onChangeText={(email) =>
                      setFormInput((prev) => ({ ...prev, email }))
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
                  <InputWithMessage
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    id="cpassword"
                    placeholder="Confirm Password"
                    value={formInput.confirmPassword}
                    password
                    errorMessages={formValidationErrors.confirmPassword.map(
                      (error) => ({
                        text: error,
                        icon: ErrorIcon,
                      })
                    )}
                    onChangeText={(confirmPassword) =>
                      setFormInput((prev) => ({ ...prev, confirmPassword }))
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
