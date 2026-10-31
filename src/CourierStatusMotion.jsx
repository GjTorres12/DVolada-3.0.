import React from 'react';
import './CourierStatusMotion.css';

// Silueta vectorizada del ícono naranja suministrado para Dvolada.
// La animación representa movimiento de entrega; no implica rastreo GPS.
export default function CourierStatusMotion({status='En camino'}){
 const moving=['Recogido','En camino','En ubicación'].includes(status);
 return <span className={'dv-courier-motion '+(moving?'is-moving':'')} role="img" aria-label={moving?'Repartidor en movimiento, estado: '+status:'Repartidor Dvolada'}>
  <svg viewBox="260 65 870 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
   <g className="dv-courier-runner" fill="#ff6900">
    <path d="M1103 326 L846 326 842 408 794 401 736 379 740 435 719 490 711 448 690 403 659 372 615 351 572 343 489 348 424 366 356 396 338 408 368 500 413 484 460 487 511 511 517 519 514 539 490 612 471 639 447 659 419 672 385 678 311 672 290 764 385 795 490 806 564 795 651 755 719 788 753 821 776 867 781 927 904 931 899 792 873 709 823 637 736 566 826 571 866 564 910 547 943 525 994 464 1103 464Z"/>
    <path d="M900 103 L884 96 853 96 792 113 724 147 660 194 668 176 691 151 747 112 719 94 687 84 649 84 617 95 581 125 560 168 558 220 577 275 627 337 656 353 694 357 745 341 783 310 807 266 812 223 801 179 819 195 860 169 899 132 905 118Z"/>
    <path d="M844 272 H1103 V314 H844Z"/>
   </g>
  </svg>
 </span>;
}
