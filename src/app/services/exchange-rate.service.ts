// exchange-rate.service.ts - CORREGIDO
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ExchangeRate {
  USD: number;
  timestamp: number;
  source: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private cache: ExchangeRate | null = null;
  private cacheTimeout = 30 * 60 * 1000; // 30 minutos

  constructor(private http: HttpClient) {}

  async getUSDRate(): Promise<ExchangeRate> {
    // Si tenemos una tasa cacheada y válida, usarla
    if (this.cache && (Date.now() - this.cache.timestamp) < this.cacheTimeout) {
      return this.cache;
    }

    try {
      console.log('🔄 Obteniendo tasa de cambio...');
      
      // ✅ OPCIÓN 1: API de ExchangeRate-API (más confiable para COP)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/COP');
      
      if (!response.ok) {
        throw new Error(`ExchangeRate-API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // ✅ VALIDAR que la respuesta tenga la estructura esperada
      if (!data.rates || data.rates.USD === undefined) {
        throw new Error('Estructura de datos inválida de ExchangeRate-API');
      }
      
      const usdRate = data.rates.USD;
      
      this.cache = {
        USD: usdRate,
        timestamp: Date.now(),
        source: 'exchangerate-api'
      };
      
      console.log('✅ Tasa de cambio obtenida:', usdRate);
      return this.cache;

    } catch (error) {
      console.warn('❌ Error con API principal, usando tasa fija...', error);
      
      // ✅ OPCIÓN 2: Tasa de cambio fija como fallback
      const fixedRate = 0.000259; // Basado en la tasa que sí funcionó
      
      this.cache = {
        USD: fixedRate,
        timestamp: Date.now(),
        source: 'fixed-fallback'
      };
      
      console.log('⚠️ Usando tasa de cambio fija:', fixedRate);
      return this.cache;
    }
  }

  // Método para convertir COP a USD
  async convertCOPtoUSD(copAmount: number): Promise<number> {
    const rate = await this.getUSDRate();
    const usdAmount = copAmount * rate.USD;
    
    console.log(`💰 Conversión: $${copAmount.toLocaleString()} COP = $${usdAmount.toFixed(2)} USD (Fuente: ${rate.source})`);
    return usdAmount;
  }

  // Validar si el monto en USD está dentro del límite de Stripe
  async isAmountWithinStripeLimit(copAmount: number): Promise<{ valid: boolean; usdAmount: number; message?: string }> {
    const usdAmount = await this.convertCOPtoUSD(copAmount);
    const stripeLimitUSD = 999999.99;
    
    if (usdAmount > stripeLimitUSD) {
      return {
        valid: false,
        usdAmount,
        message: `El monto ($${usdAmount.toFixed(2)} USD) excede el límite máximo de Stripe ($${stripeLimitUSD} USD)`
      };
    }
    
    if (usdAmount < 0.50) { // Stripe requiere mínimo $0.50 USD
      return {
        valid: false,
        usdAmount,
        message: `El monto ($${usdAmount.toFixed(2)} USD) es menor al mínimo permitido por Stripe ($0.50 USD)`
      };
    }
    
    return {
      valid: true,
      usdAmount
    };
  }
}