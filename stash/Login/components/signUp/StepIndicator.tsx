import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type StepIndicatorProps = {
  step: number
}

const steps = ['登録方法選択', 'アカウント情報登録', '登録完了']

const StepIndicator: React.FC<StepIndicatorProps> = ({ step }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.stepDisplay}>
        {/* 上部のcircle + line */}
        <View style={styles.row}>
          {steps.map((_, index) => {
            const isActive = step === index + 1
            return (
              <React.Fragment key={index}>
                <View
                  style={[
                    styles.circle,
                    isActive ? styles.activeCircle : styles.inactiveCircle,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      isActive ? styles.activeText : styles.inactiveText,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                {index < steps.length - 1 && <View style={styles.line} />}
              </React.Fragment>
            )
          })}
        </View>
      </View>

      {/* 下部のラベル群 */}
      <View style={styles.stepLabelContainer}>
        <View style={styles.labelRow}>
          {steps.map((label, index) => {
            const isActive = step === index + 1
            return (
              <Text
                key={index}
                style={[styles.stepLabel, { opacity: isActive ? 1 : 0.5 }]}
              >
                {label}
              </Text>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  activeCircle: {
    backgroundColor: '#F5C518',
    borderColor: '#F5C518',
  },
  activeText: {
    color: '#000000',
    fontSize: 16,
  },
  circle: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  circleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  inactiveCircle: {
    backgroundColor: '#1A1A1A',
    borderColor: '#F5C518',
  },
  inactiveText: {
    color: '#FFF',
  },
  labelRow: {
    //backgroundColor:'#2490c2ff',
    alignItems: 'center',

    flexDirection: 'row',

    justifyContent: 'space-between',
    marginTop: 6,
  },
  line: {
    alignSelf: 'center',
    backgroundColor: '#F5C518',
    flex: 1,
    height: 2,
  },
  stepDisplay: {
    //backgroundColor:"#221f23ff",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  row: {
    flexDirection: 'row',
    width:'90%',
    alignItems:'baseline',
    justifyContent:'flex-start',
    //backgroundColor:'#0f0e0fff',
  },

  wrapper: {
    width: '90%',
    paddingHorizontal: 1,
    paddingBottom: 12,
    //backgroundColor:'#14ccd2ff',
  },
  stepLabel: {
    alignItems: 'center',
    color: '#ffffff',
    fontSize: 14,
    justifyContent: 'center',
    textAlign: 'center',
    width: 140,
  },
  stepLabelContainer: {
    alignItems: 'center',

    //backgroundColor:"#c98fe0ff",
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
})

export default StepIndicator
