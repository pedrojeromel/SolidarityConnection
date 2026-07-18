import type { ReactNode } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { colors } from '../theme'

export function Card({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}) {
  return <View style={[styles.card, style]}>{children}</View>
}

type ButtonVariant = 'brand' | 'default' | 'ghost' | 'danger'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

export function Button({
  title,
  onPress,
  variant = 'default',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const blocked = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      style={({ pressed }) => [
        styles.button,
        buttonVariants[variant],
        pressed && !blocked && styles.buttonPressed,
        blocked && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.fg} />
      ) : (
        <Text style={[styles.buttonText, buttonTexts[variant]]}>{title}</Text>
      )}
    </Pressable>
  )
}

interface FieldProps {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  keyboardType?: KeyboardTypeOptions
  secureTextEntry?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  maxLength?: number
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize = 'none',
  maxLength,
}: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.dim}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        style={styles.fieldInput}
      />
    </View>
  )
}

export function Alert({
  kind,
  message,
}: {
  kind: 'error' | 'success'
  message: string
}) {
  const isError = kind === 'error'

  return (
    <View
      style={[
        styles.alert,
        {
          borderColor: isError ? `${colors.danger}66` : `${colors.ok}66`,
          backgroundColor: isError ? `${colors.danger}1a` : `${colors.ok}1a`,
        },
      ]}
    >
      <Text style={{ color: isError ? colors.danger : colors.ok, fontSize: 13 }}>
        {message}
      </Text>
    </View>
  )
}

export function Badge({
  label,
  color = colors.brand2,
}: {
  label: string
  color?: string
}) {
  return (
    <View style={[styles.badge, { borderColor: `${color}66` }]}>
      <Text style={[styles.badgeText, { color }]}>{label.toUpperCase()}</Text>
    </View>
  )
}

export function ProgressBar({
  raised,
  goal,
}: {
  raised: number
  goal: number
}) {
  const percent = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{percent.toFixed(1)}% da meta</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    padding: 16,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fieldWrap: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.muted,
  },
  fieldInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line2,
    backgroundColor: colors.bg2,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.fg,
  },
  alert: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  progressWrap: {
    gap: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  progressLabel: {
    fontSize: 11,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
})

const buttonVariants: Record<ButtonVariant, ViewStyle> = {
  brand: {
    backgroundColor: colors.brand,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  default: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line2,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: `${colors.danger}1a`,
    borderWidth: 1,
    borderColor: `${colors.danger}66`,
  },
}

const buttonTexts: Record<ButtonVariant, { color: string }> = {
  brand: { color: '#ffffff' },
  default: { color: colors.fg },
  ghost: { color: colors.muted },
  danger: { color: colors.danger },
}
