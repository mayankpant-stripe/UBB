# UBB (Usage-Based Billing) Demo Page

This page demonstrates Stripe's Usage-Based Billing capabilities with multiple pricing tiers and payment flows.

## Overview

The UBB page showcases different subscription plans with Stripe integration:
- **Starter Plan**: $10/month with usage-based billing
- **Advanced Plan**: $50/month with higher limits
- **Pro Plan**: $100/month for enterprise users
- **Core Plan**: Custom pricing
- **Free Plan**: Limited free tier

## Features

- 🎯 **Multiple Payment Flows**: Supports different Stripe checkout sessions
- 📊 **Usage Tracking**: Integrated meter events for tracking API usage
- 💳 **Payment Processing**: Secure Stripe payment integration
- 🔄 **Real-time Updates**: Dynamic pricing and usage display
- 📱 **Responsive Design**: Mobile-friendly interface

## File Structure

- **Page**: `app/UBB/page.tsx` - Main UBB demo component
- **Layout**: `app/UBB/layout.tsx` - Page layout wrapper
- **Success Pages**: 
  - `success/page.tsx` - General success page
  - `success_core/page.tsx` - Core plan success
  - `success_pay_as_you_go/page.tsx` - Pay-as-you-go success
  - `customunitssuccess/page.tsx` - Custom units success

## API Integration

The page integrates with several Stripe API endpoints:
- `/api/create-starter-flow` - Creates starter subscription
- `/api/create-advanced-flow` - Creates advanced subscription  
- `/api/create-core-flow` - Creates core subscription
- `/api/create-free-flow` - Creates free tier
- `/api/meter-*` - Usage tracking endpoints

## Usage

Navigate to `/UBB` to access the demo page. Users can:
1. Select a pricing plan
2. Complete Stripe checkout
3. Track usage through integrated meters
4. View success pages after payment
