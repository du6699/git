import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Icon from '../Icon'
import './index.scss'

interface LoadingScreenProps {
  text?: string
  subText?: string
}

const tips = [
  '正在唤醒花花草草...',
  'AI 正在整装待发...',
  '连接植物世界中...',
  '加载养护秘籍...',
  '准备好陪伴你的绿植了吗？',
]

const LoadingScreen: React.FC<LoadingScreenProps> = ({ text, subText }) => {
  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  return (
    <View className='loading-screen'>
      <View className='bg-circle bg-circle-1' />
      <View className='bg-circle bg-circle-2' />
      <View className='bg-circle bg-circle-3' />

      <View className='floating-icon floating-icon-1'>
        <Icon name='leaf' size={32} color='rgba(255,255,255,0.18)' />
      </View>
      <View className='floating-icon floating-icon-2'>
        <Icon name='flower2' size={24} color='rgba(255,255,255,0.12)' />
      </View>
      <View className='floating-icon floating-icon-3'>
        <Icon name='sprout' size={28} color='rgba(255,255,255,0.15)' />
      </View>

      <View className='loading-content'>
        <View className='logo-wrapper'>
          <View className='ring-outer' />
          <View className='ring-middle' />
          <View className='ring-inner' />
          <View className='logo-container'>
            <Image
              src={require('../../assets/logo.png')}
              className='logo-image'
              mode='aspectFit'
            />
          </View>
        </View>

        <View className='brand-text'>
          <Text className='brand-title'>护花使者</Text>
          <Text className='brand-subtitle'>你的掌上植物管家</Text>
        </View>

        <View className='spinner-wrapper'>
          <View className='spinner'>
            <View className='spinner-dot spinner-dot-1' />
            <View className='spinner-dot spinner-dot-2' />
            <View className='spinner-dot spinner-dot-3' />
          </View>
        </View>

        <Text className='loading-text'>{text || '加载中'}</Text>
        <Text className='loading-subtext'>{subText || randomTip}</Text>
      </View>

      <View className='footer-hint'>
        <Text className='footer-text'>让每一株植物都被温柔以待</Text>
      </View>
    </View>
  )
}

export default LoadingScreen
