import { EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Attachment } from 'src/app/models/attachment.model';
import { Pia } from 'src/app/models/pia.model';
import { LanguagesService } from 'src/app/services/languages.service';
import { ModalsService } from 'src/app/services/modals.service';
import { PiaService } from 'src/app/services/pia.service';
import { Structure } from 'src/app/models/structure.model';
import { StructureService } from 'src/app/services/structure.service';

import * as FileSaver from 'file-saver';
declare const require: any;


@Component({
  selector: 'app-pia-card',
  templateUrl: './pia-card.component.html',
  styleUrls: ['./pia-card.component.scss']
})
export class PiaCardComponent implements OnInit {
  @Input() pia: any;
  @Input() previousPia: any;
  @Output() piaEvent = new EventEmitter<Pia>();
  piaForm: FormGroup;
  attachments: any;

  @ViewChild('piaName', { static: true }) private piaName: ElementRef;
  @ViewChild('piaCategory', { static: true }) private piaCategory: ElementRef;
  @ViewChild('piaAuthorName', { static: true })
  private piaAuthorName: ElementRef;
  @ViewChild('piaEvaluatorName', { static: true })
  private piaEvaluatorName: ElementRef;
  @ViewChild('piaValidatorName', { static: true })
  private piaValidatorName: ElementRef;

  constructor(
    private modalsService: ModalsService,
    public piaService: PiaService,
    private translateService: TranslateService,
    public languagesService: LanguagesService,
    public structureService: StructureService
  ) {}

  ngOnInit(): void {

    // GET STRUCTURE LIST
    const structure = new Structure();
    structure.getAll().then((data: any) => {
      this.structureService.structures = data;
    });

    this.piaForm = new FormGroup({
      id: new FormControl(this.pia.id),
      name: new FormControl({ value: this.pia.name, disabled: false }),
      category: new FormControl({ value: this.pia.category, disabled: false }),
      author_name: new FormControl({
        value: this.pia.author_name,
        disabled: false
      }),
      evaluator_name: new FormControl({
        value: this.pia.evaluator_name,
        disabled: false
      }),
      validator_name: new FormControl({
        value: this.pia.validator_name,
        disabled: false
      })
    });

    const attachmentModel = new Attachment();
    this.attachments = [];
    attachmentModel.pia_id = this.pia.id;
    attachmentModel.findAll().then((entries: any) => {
      entries.forEach(element => {
        if (element['file'] && element['file'].length) {
          this.attachments.push(element);
        }
      });
    });
  }

  /**
   * Generate a ZIP with the attachments and the .json
   */
  async generateZip() {
    setTimeout(() => {
      const JSZip = require('jszip');
      const zip = new JSZip();
      /* Attachments */
      this.addAttachmentsToZip(zip).then((zip2: any) => {
        /* JSON */
        this.piaService.export(this.pia.id).then((data: any) => {
          zip2.file('pia.json', data, { binary: true });
          /* Save as .zip */
          zip2.generateAsync({ type: 'blob' }).then(blobContent => {
            FileSaver.saveAs(blobContent, 'pia-' + this.pia.name + '.zip');
          });
        });
      });
    }, 500);
  }

  /**
   * Add all active attachments (not the removed ones) to the zip after converting them as blob files
   * @param zip
   */
  async addAttachmentsToZip(zip): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.attachments.forEach(attachment => {
        const byteCharacters1 = atob((attachment.file as any).split(',')[1]);
        const folderName = this.translateService.instant(
          'summary.attachments'
        );
        zip.file(folderName + '/' + attachment.name, byteCharacters1, {
          binary: true
        });
      });
      resolve(zip);
    });
  }

  /**
   * Focuse PIA name field.
   */
  piaNameFocusIn(): void {
    this.piaForm.controls['name'].enable();
    this.piaName.nativeElement.focus();
  }

  /**
   * Disabls PIA name field and saves data.
   */
  piaNameFocusOut(): void {
    let userText = this.piaForm.controls['name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.pia.name = this.piaForm.value.name;
      this.pia.update();
      this.piaEvent.emit(this.pia);
    }
  }

  /**
   * Focuse PIA author name field.
   */
  piaAuthorNameFocusIn(): void {
    this.piaAuthorName.nativeElement.focus();
  }

  /**
   * Disable PIA author name field and saves data.
   */
  piaAuthorNameFocusOut(): void {
    let userText = this.piaForm.controls['author_name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.pia.author_name = this.piaForm.value.author_name;
      this.pia.update();
      this.piaEvent.emit(this.pia);
    }
  }

  /**
   * Focus PIA evaluator name field.
   */
  piaEvaluatorNameFocusIn(): void {
    this.piaEvaluatorName.nativeElement.focus();
  }

  /**
   * Disable PIA evaluator name field and saves data.
   */
  piaEvaluatorNameFocusOut(): void {
    let userText = this.piaForm.controls['evaluator_name'].value;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.pia.evaluator_name = this.piaForm.value.evaluator_name;
      this.pia.update();
      this.piaEvent.emit(this.pia);
    }
  }

  /**
   * Focus PIA validator name field.
   */
  piaValidatorNameFocusIn(): void {
    this.piaValidatorName.nativeElement.focus();
  }

  /**
   * Disable PIA validator name field and saves data.
   */
  piaValidatorNameFocusOut(): void {
    let userText = this.piaForm.value.validator_name;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.pia.validator_name = this.piaForm.value.validator_name;
      this.pia.update();
      this.piaEvent.emit(this.pia);
    }
  }

  /**
   * Focus PIA category field.
   */
  piaCategoryFocusIn(): void {
    this.piaCategory.nativeElement.focus();
  }

  /**
   * Disable PIA category field and saves data.
   */
  piaCategoryFocusOut(): void {
    let userText = this.piaForm.value.category;
    if (userText) {
      userText = userText.replace(/^\s+/, '').replace(/\s+$/, '');
    }
    if (userText !== '') {
      this.pia.category = this.piaForm.value.category;
      this.pia.update();
      this.piaEvent.emit(this.pia);
    }
  }

  /**
   * Archive a PIA with a given id.
   * @param {string} id - The PIA id.
   */
  archivePia(id: string): void {
    localStorage.setItem('pia-to-archive-id', id);
    this.modalsService.openModal('modal-archive-pia');
  }
}
