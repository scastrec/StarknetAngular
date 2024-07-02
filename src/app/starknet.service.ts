import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConnectedStarknetWindowObject, connect, disconnect } from "@argent/get-starknet";
import { stark, Provider, Contract, constants } from "starknet";
import { test1Abi, addrTESTCONTRACT } from './contracts/counter-abi';

@Injectable({
  providedIn: 'root'
})
export class StarknetService {

  private connection: ConnectedStarknetWindowObject | undefined;
  private provider: Provider | undefined;

  private connection$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private counter$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  readonly contractAddress = "0x001892d81e09cb2c2005f0112891dacb92a6f8ce571edd03ed1f3e549abcf37f";

  contract: Contract | undefined;

  public get isConnected(): Observable<boolean> {
    return this.connection$.asObservable();
  }

    public get counter(): Observable<number> {
      return this.counter$.asObservable();
    }

  public async connect() {
    const connection = await connect({webWalletUrl: "https://web.argent.xyz"});
    if (connection && connection.isConnected) {
      console.log("Connected with " + connection.selectedAddress);
      console.log("Connected chainId " + connection.chainId);
      this.connection = connection;
      this.provider = connection.provider;
      this.connection$.next(true);
      //this.updateLocalCount();
    }
  }

  public async disconnect() {
    await disconnect();
    this.connection = undefined;
    this.provider = undefined;
    this.connection$.next(false);
  }

  public async  increment() {
    try {
      if (this.connection) {
        const contract = await this.getContract();
        const response = await contract.populate('increase_counter', [1]);
        console.log("decrement response = " + response);
        this.updateLocalCount();
      }
    } catch (err) {
      console.error("Error increment counter " + err)
    }
  }

  public async decrement() {
    try {
      if (this.connection) {
        const contract = await this.getContract();
        const response = await contract.populate('increase_counter', [-1]);
        console.log("decrement response = " + response);
        this.updateLocalCount();
      }
    } catch (err) {
      console.error("Error increment counter " + err)
    }
  }

  private async updateLocalCount() {
    try {
      const contract = await this.getContract();
      const countResponse = await contract.invoke('get_balance');
      console.log("countResponse " + JSON.stringify(countResponse));
      //this.counter$.next(countResponse.res);
    } catch (err) {
      console.error("Error get counter " + err)
    }
  };

  private async getContract(): Promise<Contract> {
    //initialize Provider
    console.log("getContract")
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_MAIN } });
    console.log("provider instantiated")
    const counterContract = new Contract(test1Abi, this.contractAddress, provider);
    console.log("counter contract available")
    return counterContract;
  }
}
