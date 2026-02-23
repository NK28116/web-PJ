import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  DimensionValue,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// --- Types ---

export interface BottomSheetMenuItem {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
  textColor?: string;
  showChevron?: boolean;
  type?: 'default' | 'toggle' | 'navigation'; // Helper to auto-set props
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
}

export interface BottomSheetSelectionItem {
  label: string;
  value: string;
}

// --- Main Component ---

interface CustomDynamicModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: DimensionValue;
}

export const CustomDynamicModal: React.FC<CustomDynamicModalProps> = ({
  visible,
  onClose,
  title,
  children,
  height,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[styles.contentContainer, height ? { height } : undefined]}
            >
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
              {title && (
                <View style={styles.titleContainer}>
                  <Text style={styles.sheetTitle}>{title}</Text>
                </View>
              )}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// --- Sub Components ---

interface BottomSheetItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
  textColor?: string;
  showChevron?: boolean;
}

export const BottomSheetItem: React.FC<BottomSheetItemProps> = ({
  icon,
  label,
  onPress,
  rightElement,
  isDestructive = false,
  textColor,
  showChevron = false,
}) => {
  const color = isDestructive ? '#FF3B30' : textColor || '#fff';

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.itemLeft}>
        {icon && (
          <Ionicons
            name={icon}
            size={24}
            color={color}
            style={styles.itemIcon}
          />
        )}
        <Text style={[styles.itemLabel, { color }]}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {rightElement}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );
};

interface BottomSheetRadioButtonProps {
  selected: boolean;
  onPress: () => void;
}

export const BottomSheetRadioButton: React.FC<BottomSheetRadioButtonProps> = ({
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

interface BottomSheetSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const BottomSheetSwitch: React.FC<BottomSheetSwitchProps> = ({
  value,
  onValueChange,
}) => {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#767577', true: '#81b0ff' }}
      thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
    />
  );
};

// --- Pattern Components ---

// 1. Menu List (Action Sheet style)
export const BottomSheetMenuList: React.FC<{
  items: BottomSheetMenuItem[];
}> = ({ items }) => {
  return (
    <ScrollView style={styles.scrollContent}>
      {items.map((item) => {
        let rightElement = item.rightElement;
        let showChevron = item.showChevron;

        if (
          item.type === 'toggle' &&
          item.toggleValue !== undefined &&
          item.onToggleChange
        ) {
          rightElement = (
            <BottomSheetSwitch
              value={item.toggleValue}
              onValueChange={item.onToggleChange}
            />
          );
        } else if (item.type === 'navigation') {
          showChevron = true;
        }

        return (
          <BottomSheetItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            onPress={item.onPress}
            isDestructive={item.isDestructive}
            textColor={item.textColor}
            rightElement={rightElement}
            showChevron={showChevron}
          />
        );
      })}
    </ScrollView>
  );
};

// 2. Selection List (Radio Selection style)
export const BottomSheetSelectionList: React.FC<{
  items: BottomSheetSelectionItem[];
  selectedValue: string;
  onSelect: (value: string) => void;
}> = ({ items, selectedValue, onSelect }) => {
  return (
    <ScrollView style={styles.scrollContent}>
      {items.map((item) => (
        <BottomSheetItem
          key={item.value}
          label={item.label}
          onPress={() => onSelect(item.value)}
          rightElement={
            <BottomSheetRadioButton
              selected={selectedValue === item.value}
              onPress={() => onSelect(item.value)}
            />
          }
        />
      ))}
    </ScrollView>
  );
};

// 3. Toggle List (Switch style)
export const BottomSheetToggleList: React.FC<{
  items: BottomSheetMenuItem[];
}> = ({ items }) => {
  return (
    <ScrollView style={styles.scrollContent}>
      {items.map((item) => (
        <BottomSheetItem
          key={item.id}
          label={item.label}
          rightElement={
            item.toggleValue !== undefined && item.onToggleChange ? (
              <BottomSheetSwitch
                value={item.toggleValue}
                onValueChange={item.onToggleChange}
              />
            ) : null
          }
        />
      ))}
    </ScrollView>
  );
};

// 4. Input List (Text Input style)
export const BottomSheetInputList: React.FC<{
  items: BottomSheetMenuItem[];
}> = ({ items }) => {
  return (
    <ScrollView style={styles.scrollContent}>
      {items.map((item) => (
        <BottomSheetItem
          key={item.id}
          label={item.label}
          rightElement={
            <TextInput
              placeholder="Enter text"
              placeholderTextColor="#666"
              style={{ minWidth: 100, color: '#fff', textAlign: 'right' }}
            />
          }
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  contentContainer: {
    backgroundColor: '#333',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  titleContainer: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#444',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  scrollContent: {
    maxHeight: '100%',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#444',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#fff',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
