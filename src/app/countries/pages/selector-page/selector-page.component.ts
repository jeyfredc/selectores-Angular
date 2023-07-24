import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms'
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry, Country } from '../../interfaces/country.interfaces';
import {filter, switchMap,tap} from 'rxjs'
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  public countriesByRegion: SmallCountry[] = []
  public borders: SmallCountry[] = []

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],

  })

  constructor(
    private fb:FormBuilder,
    private countriesService: CountriesService
    ){}

  ngOnInit(): void {
    this.onRegionChanged()
    this.onCountryChanged()
  }

    get regions():Region[] {
      return this.countriesService.regions
    }

    onRegionChanged():void {
      this.myForm.get('region')!.valueChanges
      .pipe(
        /* El tap es para disparar un evento secundario, cuando el valor del continente cambia, vuelve el pais vacio pero
        es como si reiniciara el formulario entonces el select no va a estar en blanco si no que va a mostrar
        su valor original que es seleccione pais  */
        tap( ()=> this.myForm.get('country')!.setValue('')),
        /* Switchmap viene porque la respuesta viene de un Observable y la unica forma de retornar otro Observable es mediante 
        switchMap */
        switchMap(region => this.countriesService.getCountriesByRegion(region))
      )
      .subscribe(countries =>{
        this.countriesByRegion = countries
        
      })
    }

    onCountryChanged():void {
      this.myForm.get('country')!.valueChanges
      .pipe(
        /* El tap es para disparar un evento secundario, cuando el valor del continente cambia, vuelve el pais vacio pero
        es como si reiniciara el formulario entonces el select no va a estar en blanco si no que va a mostrar
        su valor original que es seleccione pais  */
        tap( ()=> this.myForm.get('border')!.setValue('')),
        /* Si cambia la region los borders se vuelven un arreglo vacio */
        tap( ()=> this.borders= []),

        /* el Filter sirve para permitir o no continuar con la funcion, si el value, es mayor a 0 continua */
        filter((value:string) => value.length >0),
        /* Switchmap viene porque la respuesta viene de un Observable y la unica forma de retornar otro Observable es mediante 
        switchMap */
        switchMap((alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode)),
        switchMap( (country) => this.countriesService.getCountryBordersByCodes( country.borders ) )
      )
      .subscribe(countries =>{
        this.borders = countries
        
      })
    }

}
