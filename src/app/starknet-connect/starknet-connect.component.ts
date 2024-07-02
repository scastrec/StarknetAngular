import { Component, OnInit, inject, signal, DestroyRef} from '@angular/core';
import { StarknetService } from '../starknet.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-starknet-connect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './starknet-connect.component.html',
  styleUrl: './starknet-connect.component.scss'
})
export class StarknetConnectComponent implements OnInit {

  private readonly starknetService = inject(StarknetService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  isConnected = signal<boolean>(false);
  counter = signal<number>(0);
  counter$: Subscription | undefined;

  ngOnInit(): void {
      this.starknetService.isConnected
        .pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((value)=> {
          console.log("ngOnInit isConnected " + value);
          this.isConnected.set(value);
          if(value) {
            this.counter$ = this.starknetService.counter
            .pipe(
              takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({next: (value)=> {
              console.log("ngOnInit counter " + value);
              this.counter.set(value);
            }})
          } else {
            this.counter$?.unsubscribe();
          }
        });
  }

  connectStarknet() {
    this.starknetService.connect();
  }
  disconnectStarknet() {
    this.starknetService.disconnect();
  }

  increment() {
    this.starknetService.increment();
  }
  decrement() {
    this.starknetService.decrement();
  }

}
